import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma, Track } from "@prisma/client";

export async function POST(req: Request) {
    const { genres, userId, since } = await req.json();

    if (!genres || genres.length === 0 || !userId || !since) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const sinceDate = new Date(since);
    const genreCondition = `AND genre IN (${genres.map((g: string) => `'${g.replace(/'/g, "''")}'`).join(", ")})`;

    const query = `
        SELECT * FROM "Track"
        WHERE "createdAt" >= '${sinceDate.toISOString()}'
        ${genreCondition}
        AND id NOT IN (
            SELECT "trackId" FROM "Review" WHERE "userId" = '${userId}'
        )
        ORDER BY RANDOM() ASC
    `;

    try {
        const tracks: Track[] =
            (await prisma?.$queryRaw(Prisma.raw(query))) || [];

        return NextResponse.json(tracks, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error },
            { status: error.status || 500 }
        );
    }
}
