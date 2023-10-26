import { Discojs, SearchTypeEnum } from "discojs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { selectedGenre, pageNumber } = await req.json();

    const client = new Discojs({
        userToken: process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN,
    });

    try {
        const releases = await client.searchDatabase(
            {
                ...(selectedGenre !== "all" && { style: selectedGenre }),
                type: SearchTypeEnum.RELEASE,
            },
            {
                page: pageNumber,
            }
        );

        if (releases?.results?.length > 0) {
            const releaseIds = releases.results.map((release) => {
                return release.id;
            });

            const response = NextResponse.json(releaseIds, {
                status: 200,
            });

            return response;
        } else {
            console.log("No discogs releases found");
        }
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error },
            {
                status: 500,
            }
        );
    }
}
