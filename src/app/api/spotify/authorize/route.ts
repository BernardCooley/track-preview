import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/spotify/callback`;

        if (!clientId) {
            return NextResponse.json(
                { error: "Spotify client ID not configured" },
                { status: 500 }
            );
        }

        const state = crypto.randomBytes(16).toString("hex");

        const scopes = [
            "playlist-read-private",
            "playlist-modify-public",
            "playlist-modify-private",
        ].join(" ");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: scopes,
            redirect_uri: redirectUri,
            state: `${state}:${userId}`,
        });

        const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

        return NextResponse.json({ url: authorizeUrl, state });
    } catch (error: any) {
        console.error("Spotify authorize error:", error);
        return NextResponse.json(
            { error: "Failed to generate Spotify authorize URL" },
            { status: 500 }
        );
    }
}
