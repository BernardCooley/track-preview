import { NextResponse } from "next/server";
import { SearchedTrack } from "../../../../types";
const DeezerPublicApi = require("deezer-public-api");

export async function POST(req: Request) {
    const { trackToSearch, releaseYear } = await req.json();

    try {
        const deezer = new DeezerPublicApi();
        const tracks = await deezer.search.track(trackToSearch);

        if (tracks?.data.length > 0) {
            const track: SearchedTrack = {
                artist: tracks.data[0].artist.name,
                title: tracks.data[0].title,
                previewUrl: tracks.data[0].preview,
                id: tracks.data[0].id,
                thumbnail: tracks.data[0].album.cover_medium,
                url: tracks.data[0].link,
                releaseYear,
            };

            const response = NextResponse.json(track, {
                status: 200,
            });

            return response;
        } else {
            const response = NextResponse.json(null, {
                status: 404,
            });

            return response;
        }
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
