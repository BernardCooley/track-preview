import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: "sessionId is required" },
                { status: 400 }
            );
        }

        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid" || !session.subscription) {
            return NextResponse.json(
                { error: "Session is not a completed subscription" },
                { status: 400 }
            );
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const subscription =
            await getStripe().subscriptions.retrieve(subscriptionId);
        const firebaseId =
            subscription.metadata.firebaseId ||
            session.metadata?.firebaseId;

        if (!firebaseId) {
            return NextResponse.json(
                { error: "No firebaseId found on session" },
                { status: 400 }
            );
        }

        const item = subscription.items?.data?.[0];
        const periodEnd = item?.current_period_end
            ? new Date(item.current_period_end * 1000)
            : null;

        await prisma?.user.updateMany({
            where: { firebaseId },
            data: {
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionExpiresAt: periodEnd,
            },
        });

        return NextResponse.json({ status: "active", tier: "PRO" });
    } catch (error: any) {
        console.error("Verify checkout error:", error);
        return NextResponse.json(
            { error: "Failed to verify checkout session" },
            { status: 500 }
        );
    }
}
