import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    const authResult = await verifyAuth(req);
    if (isAuthError(authResult)) return authResult;
    const userId = authResult.uid;

    try {

        const user = await prisma?.user.findFirst({
            where: { firebaseId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        await prisma?.user.update({
            where: { id: user.id },
            data: {
                spotifyAccessToken: null,
                spotifyRefreshToken: null,
                spotifyTokenExpiresAt: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Spotify disconnect error:", error);
        return NextResponse.json(
            { error: "Failed to disconnect Spotify" },
            { status: 500 }
        );
    }
}
