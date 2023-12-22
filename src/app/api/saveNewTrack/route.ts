import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const {
        id,
        genre,
        userId,
        artist,
        title,
        currentReviewStep,
        furthestReviewStep,
        purchaseUrl,
        searchedTrack,
    } = await req.json();

    try {
        const tracks = await prisma?.$transaction([
            prisma.userTrack.findUnique({
                where: { id },
            }),
            prisma.userTrack.upsert({
                where: { id },
                update: {
                    review: {
                        create: {
                            currentReviewStep,
                            furthestReviewStep,
                            userId: userId,
                        },
                    },
                },
                create: {
                    id,
                    artist,
                    genre,
                    title,
                    purchaseUrl,
                    searchedTrack: {
                        create: searchedTrack,
                    },
                    review: {
                        create: {
                            currentReviewStep,
                            furthestReviewStep,
                            userId: userId,
                        },
                    },
                },
            }),
        ]);
   

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
