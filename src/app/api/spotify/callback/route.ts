import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    try {
        const { code, state } = await req.json();

        if (!code || !state) {
            return NextResponse.json(
                { error: "code and state are required" },
                { status: 400 }
            );
        }

        const user = await prisma?.user.findFirst({
            where: { firebaseId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/spotify/callback`;

        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                }),
            }
        );

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Spotify token exchange failed:", errorData);
            return NextResponse.json(
                { error: "Failed to exchange code for tokens" },
                { status: 400 }
            );
        }

        const tokenData = await tokenResponse.json();

        const expiresAt = new Date(
            Date.now() + tokenData.expires_in * 1000
        );

        await prisma?.user.update({
            where: { id: user.id },
            data: {
                spotifyAccessToken: tokenData.access_token,
                spotifyRefreshToken: tokenData.refresh_token,
                spotifyTokenExpiresAt: expiresAt,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Spotify callback error:", error);
        return NextResponse.json(
            { error: "Failed to process Spotify callback" },
            { status: 500 }
        );
    }
}
