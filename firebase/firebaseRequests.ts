import { doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";
import { ScrapeTrack, Track } from "../types";
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

interface UpdateTrackReviewStep {
    trackId: string;
    newReviewStep: number;
    furthestReviewStep: number;
}

export const updateTrackReviewStep = async ({
    trackId,
    newReviewStep,
    furthestReviewStep,
}: UpdateTrackReviewStep) => {
    const trackRef = doc(db, "userTracks", trackId);

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
    const q = getUserTracksQuery(userId, reviewStep, genre);

    try {
        const querySnapshot = await getDocs(q);
        const tracks = querySnapshot.docs.map((doc) => {
            return doc.data() as Track;
        }) as Track[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
    } catch (error) {
        console.log(error);
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
}: FetchStoredTracksProps): Promise<ScrapeTrack[] | null> => {
    let q = getStoredTracksQuery(genre, startYear, endYear);

    try {
        const querySnapshot = await getDocs(q as any);

        const tracks = querySnapshot.docs.map((doc) => {
            return { ...(doc.data() as ScrapeTrack), id: doc.id };
        }) as ScrapeTrack[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
    } catch (error) {
        throw error;
    }
};
