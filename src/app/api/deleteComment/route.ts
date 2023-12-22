import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { id } = await req.json();

    try {
        const deleteComment = await prisma?.comment.delete({
            where: {
                id,
            },
        });

        const response = NextResponse.json(deleteComment, {
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
