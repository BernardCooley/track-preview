import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { id } = await req.json();

    try {
        const deleteTrack = await prisma?.storedTrack.delete({
            where: {
                id,
            },
        });

        const response = NextResponse.json(deleteTrack, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to delete track" },
            {
                status: 500,
            }
        );
    }
}
