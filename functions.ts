import { fetchDiscogsReleaseTracks, fetchSpotifyTrack } from "@/bff/bff";
import { SearchedTrack, ReleaseTrack } from "./types";

interface GetSpotifyTrackProps {
    trackToSearch: ReleaseTrack | null;
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

export const getReleaseTrack = async ({
    releaseIds,
    onSuccess,
    onFail,
}: GetReleaseTracksProps) => {
    if (releaseIds && releaseIds.length > 0) {
        const releaseId =
            releaseIds[Math.floor(Math.random() * releaseIds.length)];

        const releaseTracks = await fetchDiscogsReleaseTracks({
            releaseId: releaseId,
        });

        if (releaseTracks) {
            const randomTrackNumber = Math.floor(
                Math.random() * releaseTracks.length
            );

            onSuccess({
                releaseTrack: releaseTracks[randomTrackNumber],
                releaseId: releaseId,
            });
        } else {
            onFail(releaseId);
        }
    }
};