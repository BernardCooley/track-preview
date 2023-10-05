import {
    fetchDiscogsReleaseIds,
    fetchDiscogsReleaseTracks,
    fetchSpotifyTrack,
} from "@/bff/bff";
import {
    fetchSpotifyNotFoundTracks,
    fetchUserData,
    saveNewDocument,
    updateDocument,
    updateNestedArray,
} from "./firebase/firebaseRequests";
import { ITrack, ReleaseTrack, UserData } from "./types";

interface GetSpotifyTrackProps {
    trackToSearch: ReleaseTrack[] | null;
    spotifyNotFoundTracks: ReleaseTrack[] | null;
    selectedGenre: string;
    onTrackNotFound: () => void;
    onTrackFound: () => void;
    onStartSearch: () => void;
}

export const getSpotifyTrack = async ({
    trackToSearch,
    spotifyNotFoundTracks,
    selectedGenre,
    onTrackNotFound,
    onTrackFound,
    onStartSearch,
}: GetSpotifyTrackProps): Promise<ITrack | null> => {
    onStartSearch();
    if (trackToSearch && trackToSearch.length > 0) {
        const randomTrackNumber =
            Math.floor(Math.random() * trackToSearch.length) *
            trackToSearch.length;

        if (
            !spotifyNotFoundTracks?.includes(trackToSearch[randomTrackNumber])
        ) {
            const spotifyTrack = await fetchSpotifyTrack({
                trackToSearch: trackToSearch[randomTrackNumber],
                genre: selectedGenre || "N/A",
                discogsReleaseId: trackToSearch[0].releaseId,
            });

            if (spotifyTrack?.id) {
                await saveNewDocument({
                    collection: "spotifyTracks",
                    docId: spotifyTrack.id.toString(),
                    data: spotifyTrack,
                });

                onTrackFound();
                return spotifyTrack;
            } else {
                await saveNewDocument({
                    collection: "spotifyTracksNotFound",
                    docId: new Date().getTime().toString(),
                    data: trackToSearch[randomTrackNumber],
                });

                onTrackNotFound();
                return null;
            }
        } else {
            onTrackNotFound();
            return null;
        }
    }

    return null;
};

interface GetDiscogsReleaseIdsProps {
    onSearchStart: () => void;
    selectedGenre: string;
}

export const getDiscogsReleaseIds = async ({
    onSearchStart,
    selectedGenre,
}: GetDiscogsReleaseIdsProps): Promise<number[] | null> => {
    onSearchStart();

    const randomPage = Math.floor(Math.random() * 200);
    const ids = await fetchDiscogsReleaseIds({
        selectedGenre: selectedGenre,
        pageNumber: randomPage,
    });

    if (ids) return ids;

    return null;
};

interface GetReleaseTracksProps {
    releaseIds: number[] | null;
    releaseNumber: number;
    onSuccess: (releaseTracks: ReleaseTrack[]) => void;
    onFail: (releaseNumber: number) => void;
}

export const getReleaseTracks = async ({
    releaseIds,
    releaseNumber,
    onSuccess,
    onFail,
}: GetReleaseTracksProps) => {
    if (releaseIds && releaseIds.length > 0) {
        const releaseTracks = await fetchDiscogsReleaseTracks({
            releaseId: releaseIds[releaseNumber],
        });
        if (releaseTracks) {
            onSuccess(releaseTracks);
        } else {
            onFail(releaseNumber);
        }
    }
};

export const getSpotifyNotFoundTracks = async () => {
    const notFoundTracks = await fetchSpotifyNotFoundTracks();

    if (notFoundTracks) return notFoundTracks;

    return null;
};
export interface LikeDislikeProps {
    userId: string | null;
    track: ITrack | null;
    like: boolean;
    reviewStep: number;
    storedSpotifyTracks: ITrack[] | null;
    onMoreStoredTracks: (tracks: ITrack[]) => void;
    onNoMoreStoredTracks: () => void;
}

export const likeDislike = async ({
    userId,
    track,
    like,
    reviewStep,
    storedSpotifyTracks,
    onMoreStoredTracks,
    onNoMoreStoredTracks,
}: LikeDislikeProps): Promise<ITrack[] | null> => {
    if (track) {
        if (userId) {
            if (reviewStep === 1) {
                await updateNestedArray({
                    collection: "users",
                    docId: userId,
                    field: "tracks",
                    data: {
                        id: track.id,
                        step: like ? reviewStep + 1 : 0,
                        furthestStep: like ? reviewStep + 1 : reviewStep,
                    },
                });
            } else {
                const userDataNew = await fetchUserData({ userId: userId });
                const updatedTracks = userDataNew?.tracks?.map((t) => {
                    if (track.id === t.id) {
                        return {
                            id: t.id,
                            step: like ? reviewStep + 1 : 0,
                            furthestStep: like ? reviewStep + 1 : reviewStep,
                        };
                    }
                    return t;
                });

                await updateDocument({
                    collection: "users",
                    docId: userId,
                    field: "tracks",
                    data: updatedTracks,
                });
            }
        }

        if (storedSpotifyTracks) {
            if (storedSpotifyTracks.length > 1) {
                onMoreStoredTracks(storedSpotifyTracks.splice(1));
            } else {
                onNoMoreStoredTracks();
                return null;
            }
        }
    }

    return null;
};
