import { fetchSpotifyTrack } from "@/bff/bff";
import { SearchedTrack, ReleaseTrack } from "./types";

interface GetSpotifyTrackProps {
    trackToSearch: {
        artist: string;
        title: string;
    } | null;
    onTrackFound: () => void;
}

export const getSpotifyTrack = async ({
    trackToSearch,
    onTrackFound,
}: GetSpotifyTrackProps): Promise<SearchedTrack | null> => {
    if (trackToSearch) {
        const spotifyTrack = await fetchSpotifyTrack({
            trackToSearch: trackToSearch,
        });

        if (spotifyTrack?.id) {
            onTrackFound();
            return spotifyTrack;
        } else {
            return null;
        }
    }

    return null;
};

interface GetReleaseTracksProps {
    releaseIds: number[] | null;
    onSuccess: ({
        releaseTrack,
        releaseId,
    }: {
        releaseTrack: ReleaseTrack;
        releaseId: number;
    }) => void;
    onFail: (releaseId: number) => void;
}
