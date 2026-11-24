import prisma from "@/lib/prisma";

interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export async function getValidSpotifyToken(
    userId: string
): Promise<SpotifyTokens | null> {
    const user = await prisma?.user.findFirst({
        where: { firebaseId: userId },
        select: {
            id: true,
            spotifyAccessToken: true,
            spotifyRefreshToken: true,
            spotifyTokenExpiresAt: true,
        },
    });

    if (!user?.spotifyAccessToken || !user?.spotifyRefreshToken) {
        return null;
    }

    const bufferMs = 60_000;
    const isExpired =
        !user.spotifyTokenExpiresAt ||
        new Date(user.spotifyTokenExpiresAt).getTime() - bufferMs < Date.now();

    if (!isExpired) {
        return {
            accessToken: user.spotifyAccessToken,
            refreshToken: user.spotifyRefreshToken,
            expiresAt: user.spotifyTokenExpiresAt!,
        };
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_SECRET;

    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: user.spotifyRefreshToken,
            }),
        }
    );

    if (!tokenResponse.ok) {
        return null;
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma?.user.update({
        where: { id: user.id },
        data: {
            spotifyAccessToken: tokenData.access_token,
            spotifyRefreshToken:
                tokenData.refresh_token ?? user.spotifyRefreshToken,
            spotifyTokenExpiresAt: expiresAt,
        },
    });

    return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? user.spotifyRefreshToken,
        expiresAt,
    };
}
