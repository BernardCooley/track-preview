import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    const { trackId } = await req.json();

    try {
        await prisma?.review.upsert({
            where: { userId_trackId: { userId, trackId } },
            update: {
                currentReviewStep: 4,
                furthestReviewStep: 4,
            },
            create: {
                currentReviewStep: 4,
                furthestReviewStep: 4,
                Track: { connect: { id: trackId } },
                user: { connect: { id: userId } },
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error },
            { status: error.status || 500 }
        );
    }
}
