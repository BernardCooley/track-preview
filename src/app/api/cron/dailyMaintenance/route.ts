import prisma from "@/lib/prisma";
import { notifyDiscord } from "@/lib/notifyDiscord";
import { sendGenreAlertEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import type { AlertFrequency } from "@prisma/client";

const STALE_DAYS = 60;

const RELEASE_WINDOW_DAYS = 90;

const LOOKBACK_HOURS: Record<AlertFrequency, number> = {
    DAILY: 24,
    WEEKLY: 24 * 7,
    MONTHLY: 24 * 30,
};

export function getActiveFrequencies(now: Date): AlertFrequency[] {
    const frequencies: AlertFrequency[] = ["DAILY"];
    if (now.getUTCDay() === 1) frequencies.push("WEEKLY");
    if (now.getUTCDate() === 1) frequencies.push("MONTHLY");
    return frequencies;
}

async function cleanupAnonymous() {
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
        return { deleted: 0, reviewsDeleted: 0 };
    }

    const staleUserIds = staleUsers.map((u) => u.id);

    const deletedReviews = await prisma?.review.deleteMany({
        where: { userId: { in: staleUserIds } },
    });

    const deletedUsers = await prisma?.user.deleteMany({
        where: { id: { in: staleUserIds } },
    });

    return {
        deleted: deletedUsers?.count ?? 0,
        reviewsDeleted: deletedReviews?.count ?? 0,
    };
}

async function sendGenreAlerts(now: Date) {
    if (!prisma) return { emailsSent: 0, reason: "no-db" };

    const activeFrequencies = getActiveFrequencies(now);

    let totalEmailsSent = 0;
    let totalErrors = 0;
    let totalSubscribers = 0;
    let allGenresWithNewTracks = 0;

    for (const freq of activeFrequencies) {
        const lookbackMs = LOOKBACK_HOURS[freq] * 60 * 60 * 1000;
        const since = new Date(now.getTime() - lookbackMs);

        const releaseCutoff = new Date(now.getTime() - RELEASE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        const releasedAfter = releaseCutoff.toISOString().split("T")[0];

        const newTracks = await prisma.track.groupBy({
            by: ["genre"],
            _count: { id: true },
            where: {
                createdAt: { gte: since },
                releaseDate: { gte: releasedAfter },
            },
        });

        const genreCounts = new Map<string, number>();
        for (const entry of newTracks) {
            if (entry._count.id > 0) {
                genreCounts.set(entry.genre, entry._count.id);
            }
        }

        if (genreCounts.size === 0) continue;

        allGenresWithNewTracks += genreCounts.size;
        const genresWithNewTracks = Array.from(genreCounts.keys());

        const subscribers = await prisma.user.findMany({
            where: {
                email: { not: null },
                genreAlerts: { hasSome: genresWithNewTracks },
                genreAlertFrequency: freq,
                genreEmailsEnabled: true,
                isAnonymous: false,
                subscriptionTier: "PRO",
            },
            select: {
                email: true,
                genreAlerts: true,
            },
        });

        totalSubscribers += subscribers.length;

        for (const subscriber of subscribers) {
            const matching = subscriber.genreAlerts
                .filter((g) => genreCounts.has(g))
                .map((g) => ({ genre: g, count: genreCounts.get(g)! }));

            if (matching.length === 0) continue;

            try {
                await sendGenreAlertEmail(subscriber.email!, matching);
                totalEmailsSent++;
            } catch (error: any) {
                totalErrors++;
            }
        }
    }

    if (totalSubscribers === 0 && allGenresWithNewTracks === 0) {
        return { emailsSent: 0, reason: "no-new-tracks" };
    }

    if (totalSubscribers === 0) {
        return { emailsSent: 0, reason: "no-subscribers", genresWithNewTracks: allGenresWithNewTracks };
    }

    return {
        emailsSent: totalEmailsSent,
        subscribersMatched: totalSubscribers,
        genresWithNewTracks: allGenresWithNewTracks,
        errors: totalErrors,
    };
}

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cleanup = await cleanupAnonymous();
        const alerts = await sendGenreAlerts(new Date());

        const parts = [
            `**Daily maintenance complete**`,
            `Cleanup: ${cleanup.deleted} users, ${cleanup.reviewsDeleted} reviews deleted`,
            `Genre alerts: ${alerts.emailsSent} emails sent${alerts.reason ? ` (${alerts.reason})` : ""}`,
        ];
        await notifyDiscord(parts.join("\n"));

        return NextResponse.json({ cleanup, alerts });
    } catch (error: any) {
        console.error("Daily maintenance error:", error);
        await notifyDiscord(
            `**Daily maintenance failed**\nError: ${error.message || "Unknown error"}`
        );
        return NextResponse.json(
            { error: error.message || "Maintenance failed" },
            { status: 500 }
        );
    }
}
