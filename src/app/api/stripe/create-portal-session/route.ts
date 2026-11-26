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

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: "No Stripe customer found for this user" },
                { status: 404 }
            );
        }

        const session = await getStripe().billingPortal.sessions.create({
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
