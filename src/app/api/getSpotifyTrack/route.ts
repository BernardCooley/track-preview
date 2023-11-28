import SpotifyWebApi from "spotify-web-api-node";
import SpotifyWebApiServer from "spotify-web-api-node/src/server-methods";
import { NextResponse } from "next/server";
import { SearchedTrack } from "../../../../types";

export async function POST(req: Request) {
    const { trackToSearch, releaseYear } = await req.json();

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

            const foundTracks = trackResponse.body.tracks.items.filter(
                (track: any) =>
                    track.artist.toLowerCase() ===
                    trackToSearch.artist.toLowerCase()
            );

            const foundTrack = foundTracks[0];

            if (foundTrack.preview_url) {
                const track: SearchedTrack = {
                    artist: foundTrack.artists[0].name,
                    title: foundTrack.name,
                    previewUrl: foundTrack.preview_url,
                    id: foundTrack.id,
                    thumbnail: foundTrack.album.images[0].url,
                    url: foundTrack.album.uri,
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
