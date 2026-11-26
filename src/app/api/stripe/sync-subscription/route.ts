import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    try {

        const user = await prisma?.user.findFirst({
            where: { firebaseId: userId },
        });

        if (!user?.stripeSubscriptionId && !user?.stripeCustomerId) {
            return NextResponse.json({ status: "no_subscription" });
        }

        let subscription;

        if (user.stripeCustomerId) {
            const subscriptions = await getStripe().subscriptions.list({
                customer: user.stripeCustomerId,
                limit: 1,
            });
            subscription = subscriptions.data[0] ?? null;
        }

        if (!subscription && user.stripeSubscriptionId) {
            try {
                subscription = await getStripe().subscriptions.retrieve(
                    user.stripeSubscriptionId
                );
            } catch {}
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
        const isCancelingAtPeriodEnd =
            status === "active" &&
            (subscription.cancel_at_period_end || subscription.cancel_at != null);

        const mappedStatus =
            status === "canceled" || isCancelingAtPeriodEnd
                ? "CANCELED"
                : status === "past_due"
                  ? "PAST_DUE"
                  : status === "active"
                    ? "ACTIVE"
                    : null;

        if (mappedStatus) {
            const updateData: Record<string, any> = {
                subscriptionStatus: mappedStatus,
                subscriptionTier:
                    status === "canceled" && !periodEnd
                        ? "FREE"
                        : "PRO",
                subscriptionExpiresAt: periodEnd,
                stripeSubscriptionId: subscription.id,
            };

            if (mappedStatus === "ACTIVE" && !user.subscriptionStartedAt) {
                updateData.subscriptionStartedAt = new Date(subscription.created * 1000);
            }

            if (status === "canceled" && !periodEnd) {
                updateData.subscriptionStartedAt = null;
            }

            await prisma?.user.updateMany({
                where: { firebaseId: userId },
                data: updateData,
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
