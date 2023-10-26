import { fetchDiscogsReleaseTracks, fetchSpotifyTrack } from "@/bff/bff";
import { SpotifyTrack, ReleaseTrack } from "./types";

interface GetSpotifyTrackProps {
    trackToSearch: ReleaseTrack | null;
    selectedGenre: string;
    onTrackFound: () => void;
}

export const getSpotifyTrack = async ({
    trackToSearch,
    selectedGenre,
    onTrackFound,
}: GetSpotifyTrackProps): Promise<SpotifyTrack | null> => {
    if (trackToSearch) {
        const spotifyTrack = await fetchSpotifyTrack({
            trackToSearch: trackToSearch,
            genre: selectedGenre,
            discogsReleaseId: trackToSearch.releaseId,
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
    onFail: (releaseIds: number[]) => void;
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
            onFail(releaseIds.filter((item) => item !== releaseId));
        }
    }
};