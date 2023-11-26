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
    } catch (error) {
        console.error("🚀 ~ file: route.ts:21 ~ POST ~ error:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            {
                status: 500,
            }
        );
    }
}
