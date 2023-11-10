import {
    fetchListenedTrack,
    saveNewListenedTrack,
    saveNewTrack,
    updateListenedTrack,
} from "./firebase/firebaseRequests";
import { StoredTrack, Track, User } from "./types";

export const storeTrack = async (
    like: boolean,
    reviewStep: number,
    user: User | null,
    currentTrack: Track | null,
    tracks: StoredTrack[]
) => {
    try {
        if (user?.uid && currentTrack && tracks) {
            const listenedTrack = await fetchListenedTrack({
                id: currentTrack.id,
            });

            if (listenedTrack) {
                const userIds = Array.from(
                    new Set([...listenedTrack.userIds, user.uid])
                );

                const userReviewStep = listenedTrack.reviewSteps.find(
                    (r) => r.userId === user.uid
                );

                const updatedSteps = listenedTrack.reviewSteps.map((r) => {
                    if (r.userId === user.uid) {
                        return {
                            ...r,
                            furthestReviewStep: like
                                ? reviewStep + 1
                                : reviewStep,
                            currentReviewStep: like ? reviewStep + 1 : 0,
                        };
                    } else {
                        return r;
                    }
                });

                const reviewSteps = [
                    ...listenedTrack.reviewSteps,
                    ...(userReviewStep
                        ? [
                              {
                                  userId: user.uid,
                                  furthestReviewStep: like ? 2 : 1,
                                  currentReviewStep: like ? 2 : 0,
                              },
                          ]
                        : []),
                ];

                await updateListenedTrack({
                    userIds,
                    reviewSteps: reviewStep > 1 ? updatedSteps : reviewSteps,
                    id: currentTrack.id,
                });
            } else {
                await saveNewListenedTrack({
                    track: {
                        artist: currentTrack.artist,
                        genre: currentTrack.genre,
                        searchedTrack: currentTrack.searchedTrack,
                        title: currentTrack.title,
                        id: currentTrack.id,
                        purchaseUrl: currentTrack.purchaseUrl,
                        userIds: [user.uid],
                        reviewSteps: [
                            {
                                userId: user.uid,
                                furthestReviewStep: like ? 2 : 1,
                                currentReviewStep: like ? 2 : 0,
                            },
                        ],
                    },
                    id: currentTrack.id,
                });
            }
        }

        if (user?.uid && currentTrack && tracks) {
            currentTrack.currentReviewStep = like ? 2 : 0;
            currentTrack.furthestReviewStep = like ? 2 : 1;

            await saveNewTrack({
                track: currentTrack,
                id: currentTrack.id,
            });
        }
    } catch (error) {
        throw error;
    }
};
