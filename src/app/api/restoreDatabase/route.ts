import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// import newTracks from "../../../../scraping_tracks/uploaded/38.json";
const fs = require("fs");
const path = require("path");

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

    const dir = "./scraping_tracks/uploaded";

    // await fs.readdir(dir, (err: any, files: any[]) => {
    //     files.map(async (file) => {
    //         const filePath = path.join(dir, file);
    //         const fileContents = fs.readFileSync(filePath, "utf8");
    //         const data = JSON.parse(fileContents);

    //         try {
    //             await prisma?.storedTrack.createMany({
    //                 data,
    //             });

    //             const response = NextResponse.json([], {
    //                 status: 200,
    //             });

    //             return response;
    //         } catch (error: any) {
    // console.error(error);

    // return NextResponse.json(
    //     { error: error },
    //     {
    //         status: error.status || 500,
    //     }
    // );
    //         }
    //     });
    // });
}
