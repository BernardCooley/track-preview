import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const user = await prisma?.user.findFirst({
            where: { firebaseId: userId },
        });

        if (!user?.stripeSubscriptionId && !user?.stripeCustomerId) {
            return NextResponse.json({ status: "no_subscription" });
        }

        let subscription;

        if (user.stripeSubscriptionId) {
            try {
                subscription = await getStripe().subscriptions.retrieve(
                    user.stripeSubscriptionId
                );
            } catch {}
        }

        if (!subscription && user.stripeCustomerId) {
            const subscriptions = await getStripe().subscriptions.list({
                customer: user.stripeCustomerId,
                limit: 1,
            });
            subscription = subscriptions.data[0] ?? null;
        }

        if (!subscription) {
            await prisma?.user.updateMany({
                where: { firebaseId: userId },
                data: {
                    subscriptionTier: "FREE",
                    subscriptionStatus: null,
                    stripeSubscriptionId: null,
                    subscriptionExpiresAt: null,
                },
            });
            return NextResponse.json({ status: "FREE", tier: "FREE" });
        }

        if (subscription.id !== user.stripeSubscriptionId) {
            await prisma?.user.updateMany({
                where: { firebaseId: userId },
                data: { stripeSubscriptionId: subscription.id },
            });
        }

        const item = subscription.items?.data?.[0];
        const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000)
            : null;

        const status = subscription.status;
        const isCanceling =
            subscription.cancel_at_period_end ||
            subscription.cancel_at != null ||
            subscription.cancellation_details?.reason != null;

        const mappedStatus =
            isCanceling || status === "canceled"
                ? "CANCELED"
                : status === "past_due"
                  ? "PAST_DUE"
                  : status === "active"
                    ? "ACTIVE"
                    : null;

        if (mappedStatus) {
            await prisma?.user.updateMany({
                where: { firebaseId: userId },
                data: {
                    subscriptionStatus: mappedStatus,
                    subscriptionTier:
                        status === "canceled" && !periodEnd
                            ? "FREE"
                            : "PRO",
                    subscriptionExpiresAt: periodEnd,
                },
            });
        }

        return NextResponse.json({
            status: mappedStatus,
            tier: status === "canceled" && !periodEnd ? "FREE" : "PRO",
        });
    } catch (error: any) {
        console.error("Sync subscription error:", error);
        return NextResponse.json(
            { error: "Failed to sync subscription" },
            { status: 500 }
        );
    }
}
