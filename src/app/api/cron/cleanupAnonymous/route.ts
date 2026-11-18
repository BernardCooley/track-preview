import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const STALE_DAYS = 60;

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - STALE_DAYS);

        const staleUsers = await prisma?.user.findMany({
            where: {
                isAnonymous: true,
                lastActiveAt: { lt: cutoff },
            },
            select: { id: true },
        });

        if (!staleUsers || staleUsers.length === 0) {
            return NextResponse.json({ deleted: 0 });
        }

        const staleUserIds = staleUsers.map((u) => u.id);

        const deletedReviews = await prisma?.review.deleteMany({
            where: { userId: { in: staleUserIds } },
        });

        const deletedUsers = await prisma?.user.deleteMany({
            where: { id: { in: staleUserIds } },
        });

        return NextResponse.json({
            deleted: deletedUsers?.count ?? 0,
            reviewsDeleted: deletedReviews?.count ?? 0,
        });
    } catch (error: any) {
        console.error("Anonymous cleanup error:", error);
        return NextResponse.json(
            { error: error.message || "Cleanup failed" },
            { status: 500 }
        );
    }
}
