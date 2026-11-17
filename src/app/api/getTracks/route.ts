import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentYear } from "../../../../utils";
import { Prisma, Track } from "@prisma/client";

export async function POST(req: Request) {
    const { genres, startYear, endYear, userId, limit, reviewStep } =
        await req.json();

    const isAllGenres =
        !genres ||
        genres.length === 0 ||
        genres.some((g: string) => g.toLowerCase() === "all");
    const genreCondition = isAllGenres
        ? ""
        : `AND genre IN (${genres.map((g: string) => `'${g.replace(/'/g, "''")}'`).join(", ")})`;
    const startYearCondition = startYear ? startYear : 1960;
    const endYearCondition = endYear ? endYear : getCurrentYear();
    const limitCondition = limit ? `LIMIT ${limit}` : "";

    const q1 = `
        SELECT * FROM "Track"
        WHERE "releaseYear" BETWEEN ${startYearCondition} AND ${endYearCondition}
        ${genreCondition}
        AND id NOT IN (
            SELECT "trackId" FROM "Review" WHERE "userId" = '${userId}'
        )
        ORDER BY RANDOM() ASC
        ${limitCondition}
    `;

    const q2 = `
        SELECT * FROM "Track"
        WHERE id IN (
            SELECT "trackId" FROM "Review" WHERE "userId" = '${userId}' AND "currentReviewStep" = ${reviewStep}
        )
        ORDER BY title ASC
        ${limitCondition}
    `;

    try {
        const tracks: Track[] =
            (await prisma?.$queryRaw(Prisma.raw(reviewStep === 1 ? q1 : q2))) ||
            [];

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
