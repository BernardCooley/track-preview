import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    try {
        const totalTracks: { count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT COUNT(*)::bigint AS count
                    FROM "Review" r
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4
                `)
            )) || [];

        const genreBreakdown: { genre: string; count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT t."genre", COUNT(*)::bigint AS count
                    FROM "Review" r
                    INNER JOIN "Track" t ON t.id = r."trackId"
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4
                    GROUP BY t."genre"
                    ORDER BY count DESC
                `)
            )) || [];

        const decadeDistribution: { decade: number; count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT (t."releaseYear" / 10 * 10) AS decade, COUNT(*)::bigint AS count
                    FROM "Review" r
                    INNER JOIN "Track" t ON t.id = r."trackId"
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4
                    GROUP BY decade
                    ORDER BY decade ASC
                `)
            )) || [];

        const topArtists: { artist: string; count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT t."artist", COUNT(*)::bigint AS count
                    FROM "Review" r
                    INNER JOIN "Track" t ON t.id = r."trackId"
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4
                    GROUP BY t."artist"
                    ORDER BY count DESC
                    LIMIT 10
                `)
            )) || [];

        const purchasedCount: { count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT COUNT(*)::bigint AS count
                    FROM "Review" r
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4 AND r."purchased" = true
                `)
            )) || [];

        const totalReviewed: { count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT COUNT(*)::bigint AS count
                    FROM "Review" r
                    WHERE r."userId" = '${userId}'
                `)
            )) || [];

        const topReleases: { releaseTitle: string; artist: string; count: bigint }[] =
            (await prisma?.$queryRaw(
                Prisma.raw(`
                    SELECT t."releaseTitle", t."artist", COUNT(*)::bigint AS count
                    FROM "Review" r
                    INNER JOIN "Track" t ON t.id = r."trackId"
                    WHERE r."userId" = '${userId}' AND r."currentReviewStep" = 4
                    GROUP BY t."releaseTitle", t."artist"
                    HAVING COUNT(*) > 1
                    ORDER BY count DESC
                    LIMIT 10
                `)
            )) || [];

        const total = Number(totalTracks[0]?.count ?? 0);
        const purchased = Number(purchasedCount[0]?.count ?? 0);

        return NextResponse.json(
            {
                totalTracks: total,
                purchasedTracks: purchased,
                totalReviewed: Number(totalReviewed[0]?.count ?? 0),
                genreBreakdown: genreBreakdown.map((g) => ({
                    genre: g.genre,
                    count: Number(g.count),
                })),
                decadeDistribution: decadeDistribution.map((d) => ({
                    decade: Number(d.decade),
                    count: Number(d.count),
                })),
                topArtists: topArtists.map((a) => ({
                    artist: a.artist,
                    count: Number(a.count),
                })),
                topReleases: topReleases.map((r) => ({
                    releaseTitle: r.releaseTitle,
                    artist: r.artist,
                    count: Number(r.count),
                })),
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error },
            { status: error.status || 500 }
        );
    }
}
