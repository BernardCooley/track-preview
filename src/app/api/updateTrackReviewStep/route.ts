import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { id, like, reviewStep } = await req.json();

    try {
        const tracks = await prisma?.track.update({
            where: {
                id,
            },
            data: {
                currentReviewStep: like ? reviewStep + 1 : 0,
                furthestReviewStep: like ? reviewStep + 1 : reviewStep,
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
