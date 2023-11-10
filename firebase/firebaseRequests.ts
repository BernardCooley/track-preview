import { doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";
import { ListenedTrack, StoredTrack, Track } from "../types";
import { getStoredTracksQuery, getUserTracksQuery } from "./utils";

interface SaveNewTrackProps {
    track: Track;
    id: string;
}

export const saveNewTrack = async ({ track, id }: SaveNewTrackProps) => {
    try {
        await setDoc(doc(db, "userTracks", id), track);
    } catch (error) {
        throw error;
    }
};

interface SaveNewListenedTrackProps {
    track: ListenedTrack;
    id: string;
}

export const saveNewListenedTrack = async ({
    track,
    id,
}: SaveNewListenedTrackProps) => {
    try {
        await setDoc(doc(db, "listenedTracks", id), track);
    } catch (error) {
        throw error;
    }
};

interface UpdateNewListenedTrackProps {
    id: string;
    userIds: string[];
    reviewSteps: {
        userId: string;
        furthestReviewStep: number;
        currentReviewStep: number;
    }[];
}

export const updateListenedTrack = async ({
    id,
    userIds,
    reviewSteps,
}: UpdateNewListenedTrackProps) => {
    try {
        const trackRef = doc(db, "listenedTracks", id);

        await updateDoc(trackRef, {
            userIds,
            reviewSteps,
        });
    } catch (error) {
        throw error;
    }
};

interface FetchListenedTrackProps {
    id: string;
}

export const fetchListenedTrack = async ({
    id,
}: FetchListenedTrackProps): Promise<ListenedTrack | null> => {
    try {
        const docRef = doc(db, "listenedTracks", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ListenedTrack;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
};

interface UpdateTrackReviewStep {
    trackId: number;
    newReviewStep: number;
    furthestReviewStep: number;
}

export const updateTrackReviewStep = async ({
    trackId,
    newReviewStep,
    furthestReviewStep,
}: UpdateTrackReviewStep) => {
    const trackRef = doc(db, "userTracks", trackId.toString());

    await updateDoc(trackRef, {
        reviewStep: newReviewStep,
        furthestReviewStep: furthestReviewStep,
    });
};

interface FetchUserTracksProps {
    reviewStep?: number;
    userId: string;
    genre?: string;
}

export const fetchUserTracks = async ({
    reviewStep,
    userId,
    genre = "all",
}: FetchUserTracksProps): Promise<Track[] | null> => {
    try {
        const q = getUserTracksQuery(userId, reviewStep, genre);
        const querySnapshot = await getDocs(q);
        const tracks = querySnapshot.docs.map((doc) => {
            return doc.data() as Track;
        }) as Track[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
    } catch (error) {
        throw error;
    }
};

interface FetchStoredTracksProps {
    genre?: string;
    startYear?: number;
    endYear?: number;
}

export const fetchStoredTracks = async ({
    genre,
    startYear,
    endYear,
}: FetchStoredTracksProps): Promise<StoredTrack[] | null> => {
    try {
        let q = getStoredTracksQuery(genre, startYear, endYear);
        const querySnapshot = await getDocs(q as any);
        const tracks = querySnapshot.docs.map((doc) => {
            return { ...(doc.data() as StoredTrack), id: doc.id };
        }) as StoredTrack[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
    } catch (error) {
        throw error;
    }
};
