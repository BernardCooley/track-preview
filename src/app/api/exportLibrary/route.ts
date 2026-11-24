import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

interface LibraryTrackRow {
    title: string;
    artist: string;
    releaseTitle: string;
    genre: string;
    releaseYear: number;
    releaseDate: string;
    purchased: boolean;
    notes: string | null;
    addedAt: Date;
}

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
];

function formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}, ${date.getFullYear()}`;
}

export async function POST(req: Request) {
    try {
        const { userId, format } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        if (format && format !== "csv" && format !== "json") {
            return NextResponse.json(
                { error: "format must be 'csv' or 'json'" },
                { status: 400 }
            );
        }

        const exportFormat = format || "csv";

        const tracks: LibraryTrackRow[] = (await prisma?.$queryRaw(
            Prisma.raw(`
                SELECT
                    t."title",
                    t."artist",
                    t."releaseTitle",
                    t."genre",
                    t."releaseYear",
                    t."releaseDate",
                    r."purchased",
                    r."notes",
                    r."createdAt" AS "addedAt"
                FROM "Track" t
                INNER JOIN "Review" r ON r."trackId" = t.id
                WHERE r."userId" = '${userId.replace(/'/g, "''")}'
                  AND r."currentReviewStep" = 4
                ORDER BY t."title" ASC
            `)
        )) || [];

        if (tracks.length === 0) {
            return NextResponse.json(
                { error: "Library is empty" },
                { status: 404 }
            );
        }

        const formattedTracks = tracks.map((track) => ({
            ...track,
            releaseDate: formatDate(track.releaseDate),
            addedAt: formatDate(track.addedAt),
        }));

        if (exportFormat === "json") {
            return new NextResponse(JSON.stringify(formattedTracks, null, 2), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Disposition":
                        'attachment; filename="phoniquest-library.json"',
                },
            });
        }

        const csvHeaders = [
            "Title",
            "Artist",
            "Release",
            "Genre",
            "Year",
            "Release Date",
            "Purchased",
            "Notes",
            "Date Added",
        ];

        const escapeCSV = (value: string | number | boolean | null): string => {
            if (value === null || value === undefined) return "";
            const str = String(value);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = formattedTracks.map((track) =>
            [
                escapeCSV(track.title),
                escapeCSV(track.artist),
                escapeCSV(track.releaseTitle),
                escapeCSV(track.genre),
                escapeCSV(track.releaseYear),
                escapeCSV(track.releaseDate),
                escapeCSV(track.purchased ? "Yes" : "No"),
                escapeCSV(track.notes),
                escapeCSV(track.addedAt),
            ].join(",")
        );

        const csv = [csvHeaders.join(","), ...csvRows].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition":
                    'attachment; filename="phoniquest-library.csv"',
            },
        });
    } catch (error: any) {
        console.error("Export library error:", error);
        return NextResponse.json(
            { error: "Failed to export library" },
            { status: error.status || 500 }
        );
    }
}
