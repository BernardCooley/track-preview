import { NextResponse } from "next/server";
import { SearchedTrack } from "../../../../types";
import { ItunesMedia, ItunesSearchOptions } from "node-itunes-search";
const itunesAPI = require("node-itunes-search");

export async function POST(req: Request) {
    const { trackToSearch, releaseYear } = await req.json();

    try {
        const searchOptions = new ItunesSearchOptions({
            term: trackToSearch,
            media: ItunesMedia.Music,
            limit: 1,
        });

        const iTunesResponse = await itunesAPI.searchItunes(searchOptions);

        if (iTunesResponse) {
            const track: SearchedTrack = {
                artist: iTunesResponse.results[0].artistName,
                title: iTunesResponse.results[0].trackName,
                previewUrl: iTunesResponse.results[0].previewUrl,
                id: iTunesResponse.results[0].trackId,
                thumbnail: iTunesResponse.results[0].artworkUrl100,
                url: iTunesResponse.results[0].trackViewUrl,
                releaseYear,
            };

            const response = NextResponse.json(track, {
                status: 200,
            });

            return response;
        } else {
            const response = NextResponse.json(null, {
                status: 200,
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
