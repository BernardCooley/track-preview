import { doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";
import { StoredTrack, Track } from "../types";
import { getStoredTracksQuery, getUserTracksQuery } from "./utils";

interface SaveNewTrackProps {
    track: Track;
    id: string;
}

export const saveNewTrack = async ({ track, id }: SaveNewTrackProps) => {
    try {
        await setDoc(doc(db, "userTracks", id), track);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        throw error;
    }
};

interface FetchStoredTracksProps {
    genre?: string;
    startYear?: number;
    endYear?: number;
    startFromId: string | null;
}

export const fetchStoredTracks = async ({
    genre,
    startYear,
    endYear,
    startFromId,
}: FetchStoredTracksProps): Promise<StoredTrack[] | null> => {
    try {
        let q = getStoredTracksQuery(genre, startYear, endYear, startFromId);
        const querySnapshot = await getDocs(q as any);
        const tracks = querySnapshot.docs.map((doc) => {
            return { ...(doc.data() as StoredTrack), id: doc.id };
        }) as StoredTrack[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
