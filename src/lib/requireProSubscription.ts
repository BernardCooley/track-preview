import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerFlag } from "@/lib/amplitude-experiment-server";

export async function requireProSubscription(
    firebaseId: string
): Promise<NextResponse | null> {
    const flagKey = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_FLAG_KEY ?? "enable-subscriptions";
    const flag = await getServerFlag(flagKey, "off");
    if (flag !== "on") return null;

    const user = await prisma?.user.findFirst({
        where: { firebaseId },
        select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }

    if (user.subscriptionTier === "PRO") {
        if (user.subscriptionStatus === "ACTIVE") return null;

        if (
            user.subscriptionStatus === "PAST_DUE" &&
            user.subscriptionExpiresAt &&
            user.subscriptionExpiresAt > new Date()
        ) {
            return null;
        }
    }

    return NextResponse.json(
        { error: "Pro subscription required" },
        { status: 403 }
    );
}
