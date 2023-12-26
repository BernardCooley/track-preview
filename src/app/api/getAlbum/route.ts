import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { releaseTitle, releaseDate } = await req.json();

    try {
        const tracks = await prisma?.track.findMany({
            where: {
                releaseTitle,
                releaseDate,
            },
        });

        const response = NextResponse.json(tracks, {
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
