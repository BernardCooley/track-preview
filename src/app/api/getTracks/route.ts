import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentYear } from "../../../../utils";
import { Prisma, Track } from "@prisma/client";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    const { genres, startYear, endYear, limit, reviewStep } =
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
            SELECT "trackId" FROM "Review"
            WHERE "userId" = '${userId}'
            AND NOT (
                "currentReviewStep" = 0
                AND "updatedAt" < NOW() - INTERVAL '2 years'
                AND "trackId" IN (
                    SELECT t.id FROM "Track" t
                    INNER JOIN "Review" r2 ON r2."trackId" = t.id
                    WHERE r2."userId" = '${userId}' AND r2."currentReviewStep" = 4
                    AND t."genre" IN (
                        SELECT t2."genre"
                        FROM "Review" r3
                        INNER JOIN "Track" t2 ON t2.id = r3."trackId"
                        WHERE r3."userId" = '${userId}' AND r3."currentReviewStep" = 4
                        GROUP BY t2."genre"
                        ORDER BY COUNT(*) DESC
                        LIMIT 3
                    )
                )
            )
        )
        ORDER BY RANDOM() ASC
        ${limitCondition}
    `;

    const q2 = `
        SELECT t.*, r."purchased", r."notes" FROM "Track" t
        INNER JOIN "Review" r ON r."trackId" = t.id
        WHERE r."userId" = '${userId}' AND r."currentReviewStep" = ${reviewStep}
        ORDER BY t.title ASC
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
