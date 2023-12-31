import prisma from "@/lib/prisma";
import { Prisma, Track } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { genre, startYear, endYear, userId } = await req.json();

    try {
        const reviews = await prisma?.review.findMany({
            where: {
                userId: userId,
            },
            include: {
                Track: true,
            },
        });

        const userTrackIds =
            reviews?.map((review) => review.Track).map((track) => track.id) ||
            [];

        const notInUserIds = userTrackIds.map((id) => `'${id}'`).join(", ");

        const sql = `
            SELECT * FROM "Track"
            WHERE "releaseYear" >= ${startYear}
            ${endYear ? `AND "releaseYear" <= ${endYear}` : ""}
            ${genre.toLowerCase() === "all" ? "" : `AND "genre" = '${genre}'`}
            ${notInUserIds.length > 0 ? `AND "id" NOT IN(${notInUserIds})` : ""}
            ORDER BY RANDOM() ASC
            LIMIT 30
        `;

        const tracks: Track[] =
            (await prisma?.$queryRaw(Prisma.raw(sql))) || [];

        tracks?.sort(() => Math.random() - 0.5);

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
