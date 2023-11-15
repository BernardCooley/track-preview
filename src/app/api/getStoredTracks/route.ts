import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { genre, startYear, endYear, userId } = await req.json();

    try {
        const userTrackstracks = await prisma?.track.findMany({
            where: {
                genre,
                userId,
            },
        });

        const userTrackIds = userTrackstracks?.map((track) => track.id) || [];

        const tracks = await prisma?.storedTrack.findMany({
            take: 100,
            where: {
                ...(genre.toLowerCase() !== "all" && { genre }),
                releaseYear: {
                    gte: startYear,
                    lte: endYear,
                },
                NOT: {
                    id: {
                        in: userTrackIds,
                    },
                },
            },
        });

        const response = NextResponse.json(tracks, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log("🚀 ~ file: route.ts:39 ~ POST ~ error:", error);
        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
