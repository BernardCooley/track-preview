import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentYear } from "../../../../utils";
import { Track } from "@prisma/client";

export async function POST(req: Request) {
    const { genre, startYear, endYear, userId, limit, reviewStep } =
        await req.json();

    const q1 = {
        where: {
            ...(genre.toLowerCase() === "all" ? {} : { genre }),
            releaseYear: {
                gte: startYear ? startYear : 1960,
                lte: endYear ? endYear : getCurrentYear(),
            },
            review: {
                none: {
                    userId,
                },
            },
        },
        ...(limit ? { take: limit } : {}),
    };

    const q2 = {
        where: {
            review: {
                some: {
                    currentReviewStep: reviewStep,
                    userId,
                },
            },
        },
        ...(limit ? { take: limit } : {}),
    };

    try {
        let tracks: Track[] | undefined = [];

        if (reviewStep === 1) {
            tracks = await prisma?.track.findMany({
                ...q1,
            });
        } else {
            tracks = await prisma?.track.findMany({
                ...q2,
            });
        }

        const response = NextResponse.json(tracks, {
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
