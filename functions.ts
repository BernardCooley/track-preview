import { fetchDiscogsReleaseTracks, fetchSpotifyTrack } from "@/bff/bff";
import { ITrack, ReleaseTrack } from "./types";

interface GetSpotifyTrackProps {
    trackToSearch: ReleaseTrack | null;
    selectedGenre: string;
    onTrackFound: () => void;
}

export const getSpotifyTrack = async ({
    trackToSearch,
    selectedGenre,
    onTrackFound,
}: GetSpotifyTrackProps): Promise<ITrack | null> => {
    if (trackToSearch) {
        const spotifyTrack = await fetchSpotifyTrack({
            trackToSearch: trackToSearch,
            genre: selectedGenre || "N/A",
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
    onSuccess: (releaseTrack: ReleaseTrack) => void;
    onFail: (releaseIds: number[]) => void;
}

export const getReleaseTrack = async ({
    releaseIds,
    onSuccess,
    onFail,
}: GetReleaseTracksProps) => {
    if (releaseIds && releaseIds.length > 0) {
        const randomReleaseId =
            releaseIds[Math.floor(Math.random() * releaseIds.length)];

        const releaseTracks = await fetchDiscogsReleaseTracks({
            releaseId: randomReleaseId,
        });

        if (releaseTracks) {
            const randomTrackNumber = Math.floor(
                Math.random() * releaseTracks.length
            );

            onSuccess(releaseTracks[randomTrackNumber]);
        } else {
            onFail(releaseIds.splice(1));
        }
    }
};