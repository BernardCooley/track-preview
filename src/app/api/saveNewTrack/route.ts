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
        const tracks = await prisma?.track.create({
            data: {
                id,
                genre,
                artist,
                title,
                currentReviewStep,
                furthestReviewStep,
                purchaseUrl,
                searchedTrack: {
                    create: searchedTrack,
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
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
