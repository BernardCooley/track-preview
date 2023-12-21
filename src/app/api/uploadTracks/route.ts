import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// import newTracks from "../../../../scraping_tracks/uploaded/5.json";

export async function GET() {
    try {
        // await prisma?.storedTrack.createMany({
        //     data: newTracks,
        // });

        const response = NextResponse.json([], {
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
