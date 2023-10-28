import SpotifyWebApi from "spotify-web-api-node";
import SpotifyWebApiServer from "spotify-web-api-node/src/server-methods";
import { NextResponse } from "next/server";
import { SearchedTrack } from "../../../../types";

export async function POST(req: Request) {
    const { trackToSearch } = await req.json();

    try {
        SpotifyWebApi._addMethods = function (fncs: any) {
            Object.assign(this.prototype, fncs);
        };

        SpotifyWebApi._addMethods(SpotifyWebApiServer);

        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_SECRET;

        const spotifyApi = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: clientSecret,
        });

        const cred = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(cred.body["access_token"]);

        const trackResponse = await spotifyApi.searchTracks(
            `artist:${trackToSearch.artist} track:${trackToSearch.title}`
        );

        if (
            trackResponse.body.tracks !== undefined &&
            trackResponse.body.tracks.total > 0
        ) {
            const randomNumber = Math.floor(
                Math.floor(
                    Math.random() * trackResponse.body.tracks.items.length
                )
            );
            const tracks = trackResponse.body.tracks.items[randomNumber];

            if (tracks.preview_url) {
                const track: SearchedTrack = {
                    artist: tracks.artists[0].name,
                    title: tracks.name,
                    previewUrl: tracks.preview_url,
                    id: tracks.id,
                    thumbnail: tracks.album.images[0].url,
                    url: tracks.album.uri,
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
        } else {
            console.log("Spotify track doesnt exist");

            const response = NextResponse.json(null, {
                status: 200,
            });

            return response;
        }
    } catch (error) {
        console.log("🚀 ~ file: route.ts:46 ~ POST ~ error:", error);

        return NextResponse.json(
            { error: "Failed to get data" },
            {
                status: 500,
            }
        );
    }
}
