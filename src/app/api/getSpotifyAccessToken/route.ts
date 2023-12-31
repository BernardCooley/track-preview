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
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error },
            {
                status: error.status || 500,
            }
        );
    }
}
