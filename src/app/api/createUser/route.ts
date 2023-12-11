import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await req.json();

    try {
        const user = await prisma?.user.create({
            data: {
                id: userId,
                firebaseId: userId,
            },
        });

        const response = NextResponse.json(user, {
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
