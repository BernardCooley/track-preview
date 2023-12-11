import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, autoplay, genre, yearFrom, yearTo } = await req.json();

    const data = {
        ...(autoplay !== undefined && { autoplay }),
        ...(genre && { genre }),
        ...(yearFrom && { yearFrom }),
        ...(yearTo && { yearTo }),
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
