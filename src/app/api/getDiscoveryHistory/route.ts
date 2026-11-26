import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    const { limit, offset, search, status } = await req.json();

    const limitVal = limit ?? 50;
    const offsetVal = offset ?? 0;
    const searchTerm = search ? search.trim().replace(/'/g, "''").toLowerCase() : null;
    const searchCondition = searchTerm
        ? `AND (LOWER(t."title") LIKE '%${searchTerm}%' OR LOWER(t."artist") LIKE '%${searchTerm}%')`
        : "";
    const statusCondition = status !== undefined && status !== null
        ? `AND r."currentReviewStep" = ${Number(status)}`
        : "";

    const query = `
        SELECT
            t.*,
            r."currentReviewStep",
            r."updatedAt" AS "reviewedAt"
        FROM "Review" r
        INNER JOIN "Track" t ON t.id = r."trackId"
        WHERE r."userId" = '${userId}'
        ${searchCondition}
        ${statusCondition}
        ORDER BY r."updatedAt" DESC
        LIMIT ${limitVal}
        OFFSET ${offsetVal}
    `;

    try {
        const tracks = (await prisma?.$queryRaw(Prisma.raw(query))) || [];

        return NextResponse.json(tracks, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error },
            { status: error.status || 500 }
        );
    }
}
