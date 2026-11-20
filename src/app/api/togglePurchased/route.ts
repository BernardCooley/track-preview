import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { trackId, userId, purchased } = await req.json();

    try {
        await prisma?.review.update({
            where: {
                userId_trackId: { userId, trackId },
            },
            data: { purchased },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error },
            { status: error.status || 500 }
        );
    }
}
