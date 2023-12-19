import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { id, replied } = await req.json();

    try {
        const comment = await prisma?.comments.update({
            where: {
                id,
            },
            data: {
                replied,
            },
        });

        const response = NextResponse.json(comment, {
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
