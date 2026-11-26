import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    const { trackId, like, reviewStep, curatedMode } = await req.json();

    try {
        const likeStep = reviewStep === 1 && !curatedMode ? 4 : reviewStep + 1;

        const review = await prisma?.review.upsert({
            where: { userId_trackId: { userId, trackId } },
            update: {
                currentReviewStep: like ? likeStep : 0,
                furthestReviewStep: like ? likeStep : reviewStep,
            },
            create: {
                currentReviewStep: like ? likeStep : 0,
                furthestReviewStep: like ? likeStep : 1,
                Track: { connect: { id: trackId } },
                user: { connect: { id: userId } },
            },
        });

        return NextResponse.json(review ? [review] : [], { status: 200 });
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error },
            {
                status: error.status || 500,
            }
        );
    }
}
