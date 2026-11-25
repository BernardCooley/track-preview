import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProSubscription } from "@/lib/requireProSubscription";

export async function POST(req: Request) {
    const { trackId, userId, notes } = await req.json();

    if (!trackId || !userId) {
        return NextResponse.json(
            { error: "trackId and userId are required" },
            { status: 400 }
        );
    }

    if (notes !== null && typeof notes !== "string") {
        return NextResponse.json(
            { error: "notes must be a string or null" },
            { status: 400 }
        );
    }

    const proError = await requireProSubscription(userId);
    if (proError) return proError;

    try {
        await prisma?.review.update({
            where: {
                userId_trackId: { userId, trackId },
            },
            data: { notes: notes ?? null },
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
