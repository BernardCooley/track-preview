import { NextResponse } from "next/server";

export async function GET() {
    const getTokenInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_SPOTIFY_SECRET}`,
    };

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            getTokenInit
        );

        const token = await tokenResponse.json();

        const response = NextResponse.json(token, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log("🚀 ~ file: route.ts:26 ~ GET ~ error:", error);
        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
