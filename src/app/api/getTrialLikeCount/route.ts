import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await req.json();

    try {
        const count = await prisma?.review.count({
            where: {
                userId,
                currentReviewStep: { gt: 0 },
            },
        });

        return NextResponse.json({ count: count ?? 0 }, { status: 200 });
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error },
            { status: error.status || 500 }
        );
    }
}
