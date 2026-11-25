import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId, autoplay, genres, yearFrom, yearTo, curatedMode, swipeMode, genreAlerts, genreAlertFrequency, genreEmailsEnabled, email } = await req.json();

    const data = {
        ...(autoplay !== undefined && { autoplay }),
        ...(curatedMode !== undefined && { curatedMode }),
        ...(swipeMode !== undefined && { swipeMode }),
        ...(genres && { genres }),
        ...(genreAlerts !== undefined && { genreAlerts }),
        ...(genreAlertFrequency !== undefined && { genreAlertFrequency }),
        ...(genreEmailsEnabled !== undefined && { genreEmailsEnabled }),
        ...(email !== undefined && { email }),
        ...(yearFrom && { yearFrom }),
        ...(yearTo && { yearTo }),
        lastActiveAt: new Date(),
    };

    try {
        const updateUser = await prisma?.user.update({
            where: {
                id: userId,
            },
            data,
        });

        if (curatedMode === false) {
            await prisma?.review.updateMany({
                where: {
                    userId: userId,
                    currentReviewStep: { in: [2, 3] },
                },
                data: {
                    currentReviewStep: 4,
                    furthestReviewStep: 4,
                },
            });
        }

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
