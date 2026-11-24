import { NextResponse } from "next/server";
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
                { error: "Spotify not connected" },
                { status: 401 }
            );
        }

        const playlists: { id: string; name: string }[] = [];
        let url: string | null =
            "https://api.spotify.com/v1/me/playlists?limit=50";

        while (url) {
            const res: Response = await fetch(url, {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });

            if (!res.ok) break;

            const data: any = await res.json();
            for (const item of data.items) {
                playlists.push({ id: item.id, name: item.name });
            }
            url = data.next;
        }

        return NextResponse.json({ playlists });
    } catch (error: any) {
        console.error("Spotify playlists error:", error);
        return NextResponse.json(
            { error: "Failed to fetch playlists" },
            { status: 500 }
        );
    }
}
