import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// import newTracks from "../../../../juno_scraped_tracks/to_upload_now/38.json";

export async function GET() {
    try {
        // await prisma?.storedTrack.createMany({
        //     data: newTracks,
        // });

        const response = NextResponse.json([], {
            status: 200,
        });

        return response;
    } catch (error) {
        console.log("🚀 ~ file: route.ts:17 ~ GET ~ error:", error);
        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
