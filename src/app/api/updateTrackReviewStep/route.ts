import prisma from "@/lib/prisma";
import { Review } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { trackId, like, reviewStep, userId, curatedMode } = await req.json();

    try {
        const review = await prisma?.review.findFirst({
            where: {
                userId: userId,
                trackId: trackId,
            },
        });

        let tracks: Review[] | undefined;

        const likeStep = reviewStep === 1 && !curatedMode ? 4 : reviewStep + 1;

        if (review) {
            tracks = await prisma?.$transaction([
                prisma.review.update({
                    where: {
                        id: review.id,
                    },
                    data: {
                        currentReviewStep: like ? likeStep : 0,
                        furthestReviewStep: like ? likeStep : reviewStep,
                    },
                }),
            ]);
        } else {
            tracks = await prisma?.$transaction([
                prisma.review.create({
                    data: {
                        currentReviewStep: like ? likeStep : 0,
                        furthestReviewStep: like ? likeStep : 1,
                        Track: {
                            connect: {
                                id: trackId,
                            },
                        },
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                }),
            ]);
        }

        await prisma?.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() },
        });

        const response = NextResponse.json(tracks, {
            status: 200,
        });

        return response;
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
