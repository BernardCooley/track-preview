import prisma from "@/lib/prisma";
import { Review } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userTrackId, like, reviewStep, userId } = await req.json();

    try {
        const review = await prisma?.review.findFirst({
            where: {
                userId: userId,
                userTrackId: userTrackId,
            },
        });

        let tracks: [Review] | undefined;

        if (review) {
            tracks = await prisma?.$transaction([
                prisma.review.update({
                    where: {
                        id: review.id,
                    },
                    data: {
                        currentReviewStep: like ? reviewStep + 1 : 0,
                        furthestReviewStep: like ? reviewStep + 1 : reviewStep,
                    },
                }),
            ]);
        }

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
