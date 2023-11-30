import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await req.json();

    try {
        const deleteUsers = await prisma?.user.delete({
            where: {
                id: userId,
            },
        });

        const response = NextResponse.json(deleteUsers, {
            status: 200,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            {
                status: 500,
            }
        );
    }
}
