import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { trackId, userId } = await req.json();

    try {
        const review = await prisma?.review.findFirst({
            where: {
                userId,
                trackId,
            },
        });

        if (review) {
            await prisma?.review.update({
                where: { id: review.id },
                data: {
                    currentReviewStep: 4,
                    furthestReviewStep: 4,
                },
            });
        } else {
            await prisma?.review.create({
                data: {
                    currentReviewStep: 4,
                    furthestReviewStep: 4,
                    Track: { connect: { id: trackId } },
                    user: { connect: { id: userId } },
                },
            });
        }

        await prisma?.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() },
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
