import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, reviewStep } = await req.json();

    try {
        const reviews = await prisma?.review.findMany({
            where: {
                userId: userId,
                currentReviewStep: Number(reviewStep),
            },
            include: {
                userTrack: {
                    include: {
                        searchedTrack: true,
                    },
                },
            },
        });

        const response = NextResponse.json(reviews, {
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
