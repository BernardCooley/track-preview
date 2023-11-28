import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, autoplay } = await req.json();

    try {
        const updateUser = await prisma?.user.update({
            where: {
                id: userId,
            },
            data: {
                autoplay,
            },
        });

        const response = NextResponse.json(updateUser, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Failed to update user's autoplay" },
            {
                status: 500,
            }
        );
    }
}
