import prisma from "@/lib/prisma";
import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

const REFUND_WINDOW_DAYS = 14;

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    try {

        const user = await prisma?.user.findFirst({
            where: { firebaseId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.subscriptionTier !== "PRO" || !user.stripeSubscriptionId) {
            return NextResponse.json(
                { error: "No active Pro subscription" },
                { status: 400 }
            );
        }

        if (!user.subscriptionStartedAt) {
            return NextResponse.json(
                { error: "Subscription start date not available" },
                { status: 400 }
            );
        }

        const daysSinceStart = Math.floor(
            (Date.now() - new Date(user.subscriptionStartedAt).getTime()) /
                (1000 * 60 * 60 * 24)
        );

        if (daysSinceStart > REFUND_WINDOW_DAYS) {
            return NextResponse.json(
                { error: "Refund window has expired" },
                { status: 400 }
            );
        }

        const subscription = await getStripe().subscriptions.retrieve(
            user.stripeSubscriptionId
        );

        const latestInvoiceId =
            typeof subscription.latest_invoice === "string"
                ? subscription.latest_invoice
                : subscription.latest_invoice?.id;

        if (!latestInvoiceId) {
            return NextResponse.json(
                { error: "No invoice found for subscription" },
                { status: 400 }
            );
        }

        const payments = await getStripe().invoicePayments.list({
            invoice: latestInvoiceId,
            limit: 1,
        });

        const payment = payments.data[0];
        const paymentIntentId =
            payment?.payment?.type === "payment_intent"
                ? (typeof payment.payment.payment_intent === "string"
                    ? payment.payment.payment_intent
                    : payment.payment.payment_intent?.id)
                : null;

        if (!paymentIntentId) {
            return NextResponse.json(
                { error: "No payment found for invoice" },
                { status: 400 }
            );
        }

        await getStripe().refunds.create({
            payment_intent: paymentIntentId,
            reason: "requested_by_customer",
        });

        await getStripe().subscriptions.cancel(user.stripeSubscriptionId);

        await prisma?.user.updateMany({
            where: { firebaseId: userId },
            data: {
                subscriptionTier: "FREE",
                subscriptionStatus: "CANCELED",
                stripeSubscriptionId: null,
                subscriptionStartedAt: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Refund request error:", error);
        return NextResponse.json(
            { error: "Failed to process refund" },
            { status: 500 }
        );
    }
}
