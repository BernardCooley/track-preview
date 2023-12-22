import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { name, userId, comment, email } = await req.json();

    try {
        const comm = await prisma?.comment.create({
            data: {
                name,
                userId,
                comment,
                email,
            },
        });

        const response = NextResponse.json(comm, {
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
