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

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: "No Stripe customer found for this user" },
                { status: 404 }
            );
        }

        const session = await stripe!.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Portal session error:", error);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}
