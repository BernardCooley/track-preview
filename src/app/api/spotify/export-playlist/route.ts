import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getValidSpotifyToken } from "@/lib/spotifyUserAuth";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const tokens = await getValidSpotifyToken(userId);
        if (!tokens) {
            return NextResponse.json(
                { error: "Spotify not connected or token expired" },
                { status: 401 }
            );
        }

        const libraryTracks =
            (await prisma?.$queryRaw(
                Prisma.sql`
                    SELECT t.artist, t.title FROM "Track" t
                    INNER JOIN "Review" r ON r."trackId" = t.id
                    INNER JOIN "User" u ON u.id = r."userId"
                    WHERE u."firebaseId" = ${userId} AND r."currentReviewStep" = 4
                    ORDER BY t.title ASC
                `
            )) as { artist: string; title: string }[] | undefined;

        if (!libraryTracks || libraryTracks.length === 0) {
            return NextResponse.json(
                { error: "Library is empty" },
                { status: 400 }
            );
        }

        const spotifyUserRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });

        if (!spotifyUserRes.ok) {
            return NextResponse.json(
                { error: "Failed to get Spotify user profile" },
                { status: 502 }
            );
        }

        const spotifyUser = await spotifyUserRes.json();

        const createPlaylistRes = await fetch(
            `https://api.spotify.com/v1/users/${spotifyUser.id}/playlists`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: `Phoniquest Library – ${new Date().toLocaleDateString()}`,
                    description: "Exported from Phoniquest",
                    public: false,
                }),
            }
        );

        if (!createPlaylistRes.ok) {
            return NextResponse.json(
                { error: "Failed to create Spotify playlist" },
                { status: 502 }
            );
        }

        const playlist = await createPlaylistRes.json();

        const trackUris: string[] = [];
        for (const track of libraryTracks) {
            const query = `artist:${track.artist} track:${track.title}`;
            const searchRes = await fetch(
                `https://api.spotify.com/v1/search?${new URLSearchParams({
                    q: query,
                    type: "track",
                    limit: "1",
                })}`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                }
            );

            if (searchRes.ok) {
                const searchData = await searchRes.json();
                const items = searchData.tracks?.items;
                if (items && items.length > 0) {
                    trackUris.push(items[0].uri);
                }
            }
        }

        if (trackUris.length > 0) {
            const batches = [];
            for (let i = 0; i < trackUris.length; i += 100) {
                batches.push(trackUris.slice(i, i + 100));
            }

            for (const batch of batches) {
                await fetch(
                    `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ uris: batch }),
                    }
                );
            }
        }

        return NextResponse.json({
            playlistUrl: playlist.external_urls.spotify,
            totalLibraryTracks: libraryTracks.length,
            matchedTracks: trackUris.length,
        });
    } catch (error: any) {
        console.error("Spotify export error:", error);
        return NextResponse.json(
            { error: "Failed to export playlist" },
            { status: 500 }
        );
    }
}
