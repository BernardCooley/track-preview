import { Discojs } from "discojs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { releaseId } = await req.json();

    const client = new Discojs({
        userToken: process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN,
    });

    try {
        const release = await client.getRelease(releaseId);

        if (release.artists && release?.tracklist) {
            const response = NextResponse.json(
                release?.tracklist.map((track, i) => {
                    return {
                        artist: release.artists[i].name,
                        title: track.title,
                        releaseId: release.id,
                    };
                }),
                {
                    status: 200,
                }
            );

            return response;
        } else {
            console.log("Discogs release doesnt exist");
        }
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
