import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
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

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe!.customers.create({
                metadata: { firebaseId: userId },
            });
            stripeCustomerId = customer.id;

            await prisma?.user.update({
                where: { id: user.id },
                data: { stripeCustomerId },
            });
        }

        const session = await stripe!.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
            subscription_data: {
                metadata: { firebaseId: userId },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Checkout session error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
