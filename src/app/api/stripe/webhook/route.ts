import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

async function disableCuratedModeForUser(firebaseId: string) {
    const user = await prisma?.user.findFirst({
        where: { firebaseId },
        select: { id: true, curatedMode: true },
    });

    if (user?.curatedMode) {
        await prisma?.user.update({
            where: { id: user.id },
            data: { curatedMode: false },
        });

        await prisma?.review.updateMany({
            where: {
                userId: user.id,
                currentReviewStep: { in: [2, 3] },
            },
            data: {
                currentReviewStep: 4,
                furthestReviewStep: 4,
            },
        });
    }
}

function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
    const item = subscription.items?.data?.[0];
    if (item?.current_period_end) {
        return new Date(item.current_period_end * 1000);
    }
    return null;
}

function getSubscriptionIdFromInvoice(
    invoice: Stripe.Invoice
): string | null {
    const sub = invoice.parent?.subscription_details?.subscription;
    if (!sub) return null;
    return typeof sub === "string" ? sub : sub.id;
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("Webhook signature verification failed:", error.message);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data
                    .object as Stripe.Checkout.Session;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;

                const subscription =
                    await getStripe().subscriptions.retrieve(subscriptionId);
                const firebaseId =
                    subscription.metadata.firebaseId ||
                    session.metadata?.firebaseId;

                if (firebaseId) {
                    await prisma?.user.updateMany({
                        where: { firebaseId },
                        data: {
                            subscriptionTier: "PRO",
                            subscriptionStatus: "ACTIVE",
                            stripeCustomerId: customerId,
                            stripeSubscriptionId: subscriptionId,
                            subscriptionExpiresAt: getPeriodEnd(subscription),
                            subscriptionStartedAt: new Date(),
                        },
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data
                    .object as Stripe.Subscription;
                const status = subscription.status;
                const firebaseId = subscription.metadata.firebaseId;

                if (firebaseId) {
                    const user = await prisma?.user.findFirst({
                        where: { firebaseId },
                        select: { stripeSubscriptionId: true },
                    });

                    if (
                        user?.stripeSubscriptionId &&
                        user.stripeSubscriptionId !== subscription.id
                    ) {
                        break;
                    }

                    const mappedStatus =
                        status === "active"
                            ? "ACTIVE"
                            : status === "past_due"
                              ? "PAST_DUE"
                              : status === "canceled"
                                ? "CANCELED"
                                : null;

                    if (mappedStatus) {
                        await prisma?.user.updateMany({
                            where: { firebaseId },
                            data: {
                                subscriptionStatus: mappedStatus,
                                subscriptionTier: "PRO",
                                subscriptionExpiresAt:
                                    getPeriodEnd(subscription),
                            },
                        });

                        if (mappedStatus === "PAST_DUE" || mappedStatus === "CANCELED") {
                            await disableCuratedModeForUser(firebaseId);
                        }
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data
                    .object as Stripe.Subscription;
                const firebaseId = subscription.metadata.firebaseId;

                if (firebaseId) {
                    const user = await prisma?.user.findFirst({
                        where: { firebaseId },
                        select: { stripeSubscriptionId: true },
                    });

                    if (
                        !user?.stripeSubscriptionId ||
                        user.stripeSubscriptionId === subscription.id
                    ) {
                        await prisma?.user.updateMany({
                            where: { firebaseId },
                            data: {
                                subscriptionTier: "FREE",
                                subscriptionStatus: "CANCELED",
                                stripeSubscriptionId: null,
                                subscriptionStartedAt: null,
                            },
                        });

                        await disableCuratedModeForUser(firebaseId);
                    }
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId =
                    getSubscriptionIdFromInvoice(invoice);

                if (subscriptionId) {
                    const subscription =
                        await getStripe().subscriptions.retrieve(subscriptionId);
                    const firebaseId = subscription.metadata.firebaseId;

                    if (firebaseId) {
                        await prisma?.user.updateMany({
                            where: { firebaseId },
                            data: {
                                subscriptionStatus: "PAST_DUE",
                            },
                        });
                    }
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook handler error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
