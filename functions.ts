import { fetchDiscogsReleaseTracks, fetchSpotifyTrack } from "@/bff/bff";
import {
    saveNewDocument,
    updateDocument,
    updateNestedArray,
} from "./firebase/firebaseRequests";
import { ITrack, ReleaseTrack, UserTrack } from "./types";

interface GetSpotifyTrackProps {
    tracksToSearch: ReleaseTrack[] | null;
    selectedGenre: string;
    onTrackNotFound: () => void;
    onTrackFound: () => void;
    onStartSearch: () => void;
}

export const getSpotifyTrack = async ({
    tracksToSearch,
    selectedGenre,
    onTrackNotFound,
    onTrackFound,
    onStartSearch,
}: GetSpotifyTrackProps): Promise<ITrack | null> => {
    onStartSearch();
    if (tracksToSearch && tracksToSearch.length > 0) {
        const randomTrackNumber = Math.floor(
            Math.random() * tracksToSearch.length
        );

        const spotifyTrack = await fetchSpotifyTrack({
            trackToSearch: tracksToSearch[randomTrackNumber],
            genre: selectedGenre || "N/A",
            discogsReleaseId: tracksToSearch[0].releaseId,
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
            onTrackNotFound();
            return null;
        }
    }

    return null;
};

interface GetReleaseTracksProps {
    releaseIds: number[] | null;
    onSuccess: (releaseTracks: ReleaseTrack[]) => void;
    onFail: (releaseIds: number[]) => void;
}

export const getReleaseTracks = async ({
    releaseIds,
    onSuccess,
    onFail,
}: GetReleaseTracksProps) => {
    if (releaseIds && releaseIds.length > 0) {
        const releaseTracks = await fetchDiscogsReleaseTracks({
            releaseId: releaseIds[0],
        });

        if (releaseTracks) {
            onSuccess(releaseTracks);
        } else {
            onFail(releaseIds.splice(1));
        }
    }
};

export interface LikeDislikeProps {
    userId: string | null;
    track: ITrack | null;
    like: boolean;
    reviewStep: number;
    tracks: ITrack[] | null;
    onMoreTracks: (tracks: ITrack[]) => void;
    onNoMoreTracks: () => void;
    userTracks: UserTrack[] | null;
}

export const likeDislike = async ({
    userId,
    track,
    like,
    reviewStep,
    tracks,
    onMoreTracks,
    onNoMoreTracks,
    userTracks,
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
                        genre: track.genre,
                    },
                });
            } else {
                if (userTracks) {
                    if (!userTracks.map((tr) => tr.id).includes(track.id)) {
                        userTracks.push({
                            id: track.id,
                            step: like ? reviewStep + 1 : 0,
                            furthestStep: like ? reviewStep + 1 : reviewStep,
                            genre: track.genre,
                        });
                    }

                    const updatedTracks = userTracks.map((tr) => {
                        if (track.id === tr.id) {
                            return {
                                id: tr.id,
                                step: like ? reviewStep + 1 : 0,
                                furthestStep: like
                                    ? reviewStep + 1
                                    : reviewStep,
                                genre: track.genre,
                            };
                        }
                        return tr;
                    });

                    await updateDocument({
                        collection: "users",
                        docId: userId,
                        field: "tracks",
                        data: updatedTracks,
                    });
                }
            }
        }

        if (tracks) {
            if (tracks.length > 1) {
                onMoreTracks(tracks.splice(1));
            } else {
                onNoMoreTracks();
                return null;
            }
        } else {
            onNoMoreTracks();
        }
    }

    return null;
};
