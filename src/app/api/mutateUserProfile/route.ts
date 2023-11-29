import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, autoplay, genre } = await req.json();

    const data = {
        ...(autoplay !== undefined && { autoplay }),
        ...(genre && { genre }),
    };

    try {
        const updateUser = await prisma?.user.update({
            where: {
                id: userId,
            },
            data,
        });

        const response = NextResponse.json(updateUser, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Failed to update user's profile" },
            {
                status: 500,
            }
        );
    }
}
