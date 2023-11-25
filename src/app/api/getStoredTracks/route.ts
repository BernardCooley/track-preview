import prisma from "@/lib/prisma";
import { Prisma, StoredTrack } from "@prisma/client";
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

        const notInUserIds = userTrackIds.map((id) => `'${id}'`).join(", ");

        const sql = `
            SELECT * FROM "StoredTrack"
            WHERE "releaseYear" >= ${startYear}
            ${endYear ? `AND "releaseYear" <= ${endYear}` : ""}
            ${genre.toLowerCase() === "all" ? "" : `AND "genre" = '${genre}'`}
            ${notInUserIds.length > 0 ? `AND "id" NOT IN(${notInUserIds})` : ""}
            ORDER BY RANDOM() ASC
            LIMIT 100
        `;

        const tracks: StoredTrack[] =
            (await prisma?.$queryRaw(Prisma.raw(sql))) || [];

        tracks?.sort(() => Math.random() - 0.5);

        const response = NextResponse.json(tracks, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.error("🚀 ~ file: route.ts:39 ~ POST ~ error:", error);
        console.log(process.env.POSTGRES_PHONIQUEST_URL);
        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
