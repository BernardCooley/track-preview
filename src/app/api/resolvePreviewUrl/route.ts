import prisma from "@/lib/prisma";
import { deezer } from "@/lib/deezer";
import { NextResponse } from "next/server";

function toProxyUrl(url: string): string {
    if (!url) return "";
    return `/api/proxyAudio?url=${encodeURIComponent(url)}`;
}

export async function POST(req: Request) {
    const { trackId } = await req.json();

    try {
        const track = await prisma?.track.findUnique({
            where: { id: trackId },
        });

        if (!track) {
            return NextResponse.json(
                { error: "Track not found" },
                { status: 404 }
            );
        }

        let freshUrl = "";
        let discoveredDeezerTrackId = track.deezerTrackId;

        if (track.deezerTrackId) {
            try {
                const deezerTrack = await deezer.track(track.deezerTrackId);
                freshUrl = deezerTrack?.preview || "";
            } catch {
                // fall through to search
            }
        }

        if (!freshUrl) {
            try {
                const searchResult = await deezer.search.track(
                    `${track.artist} ${track.title}`
                );
                if (searchResult?.data?.[0]?.preview) {
                    freshUrl = searchResult.data[0].preview;
                    discoveredDeezerTrackId = String(searchResult.data[0].id);
                }
            } catch {
                // fall through to iTunes
            }
        }

        if (!freshUrl) {
            try {
                const itunesAPI = require("node-itunes-search");
                const { ItunesSearchOptions, ItunesMedia } = require("node-itunes-search");
                const searchOptions = new ItunesSearchOptions({
                    term: `${track.artist} ${track.title}`,
                    media: ItunesMedia.Music,
                    limit: 1,
                });
                const iTunesResponse = await itunesAPI.searchItunes(searchOptions);
                if (iTunesResponse?.resultCount > 0) {
                    freshUrl = iTunesResponse.results[0].previewUrl || "";
                }
            } catch {
                // no fallback available
            }
        }

        if (freshUrl && discoveredDeezerTrackId !== track.deezerTrackId) {
            await prisma?.track.update({
                where: { id: trackId },
                data: {
                    deezerTrackId: discoveredDeezerTrackId,
                },
            });
        }

        return NextResponse.json({
            previewUrl: freshUrl ? toProxyUrl(freshUrl) : "",
        });
    } catch (error: any) {
        console.error("Preview URL resolution error:", error);
        return NextResponse.json(
            { error: error.message || "Resolution failed" },
            { status: 500 }
        );
    }
}
