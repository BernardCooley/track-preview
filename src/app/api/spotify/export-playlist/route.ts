import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getValidSpotifyToken } from "@/lib/spotifyUserAuth";

export async function POST(req: Request) {
    try {
        const { userId, playlistId, playlistName } = await req.json();

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

        let playlist: { id: string; external_urls: { spotify: string } };
        const defaultName = "Phoniquest Library";

        if (playlistId) {
            const existingRes = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}`,
                {
                    headers: { Authorization: `Bearer ${tokens.accessToken}` },
                }
            );
            if (!existingRes.ok) {
                return NextResponse.json(
                    { error: "Playlist not found" },
                    { status: 404 }
                );
            }
            playlist = await existingRes.json();

            await fetch(
                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uris: [] }),
                }
            );
        } else {
            const name = playlistName || defaultName;

            if (!playlistName) {
                let searchUrl: string | null =
                    "https://api.spotify.com/v1/me/playlists?limit=50";
                while (searchUrl) {
                    const res: Response = await fetch(searchUrl, {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                        },
                    });
                    if (!res.ok) break;
                    const data: any = await res.json();
                    const existing = data.items.find(
                        (p: any) => p.name === defaultName
                    );
                    if (existing) {
                        playlist = existing;
                        await fetch(
                            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                            {
                                method: "PUT",
                                headers: {
                                    Authorization: `Bearer ${tokens.accessToken}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ uris: [] }),
                            }
                        );
                        break;
                    }
                    searchUrl = data.next;
                }
            }

            if (!playlist!) {
                const createRes = await fetch(
                    `https://api.spotify.com/v1/users/${spotifyUser.id}/playlists`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name,
                            description: "Exported from Phoniquest",
                            public: false,
                        }),
                    }
                );

                if (!createRes.ok) {
                    return NextResponse.json(
                        { error: "Failed to create Spotify playlist" },
                        { status: 502 }
                    );
                }

                playlist = await createRes.json();
            }
        }

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
