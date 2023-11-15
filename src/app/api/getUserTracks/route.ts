import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { genre, userId } = await req.json();

    try {
        const tracks = await prisma?.track.findMany({
            where: {
                genre,
                userId,
            },
        });

        const response = NextResponse.json(tracks, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log("🚀 ~ file: route.ts:21 ~ POST ~ error:", error);
        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
