import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { genre, userId, reviewStep } = await req.json();

    try {
        const tracks = await prisma?.track.findMany({
            where: {
                genre: genre.toLowerCase() === "all" ? undefined : genre,
                userId,
                currentReviewStep: Number(reviewStep),
            },
            include: {
                searchedTrack: true,
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
