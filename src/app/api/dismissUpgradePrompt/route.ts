import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, reset, date } = await req.json();

    try {
        const value = reset ? null : date ? new Date(date) : new Date();
        await prisma?.user.update({
            where: { id: userId },
            data: { upgradePromptDismissedAt: value },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error },
            { status: error.status || 500 }
        );
    }
}
