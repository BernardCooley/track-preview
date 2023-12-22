import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const comments = await prisma?.comment.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        const response = NextResponse.json(comments, {
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
