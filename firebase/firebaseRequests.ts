import {
    Timestamp,
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebaseInit";
import { ScrapeTrack, Track } from "../types";

interface SaveNewTrackProps {
    track: Track;
}

export const saveNewTrack = async ({ track }: SaveNewTrackProps) => {
    try {
        await addDoc(collection(db, "userTracks"), track);
    } catch (error) {
        throw error;
    }
};

interface GetUserTracksProps {
    genre: string;
    currentReviewStep: number;
    userId: string;
}

export const fetchUserTracks = async ({
    genre,
    currentReviewStep,
    userId,
}: GetUserTracksProps): Promise<Track[] | null> => {
    const q = query(
        collection(db, "userTracks"),
        where("genre", "==", genre),
        where("userId", "==", userId),
        where("currentReviewStep", "==", currentReviewStep)
    );

    try {
        const querySnapshot = await getDocs(q as any);

        const tracks = querySnapshot.docs.map((doc) => {
            return { ...(doc.data() as Track), id: doc.id };
        }) as Track[];

        if (tracks.length > 0) {
            return tracks;
        }

        return null;
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
        currentReviewStep: newReviewStep,
        furthestReviewStep: furthestReviewStep,
    });
};

interface FetchStoredTracksProps {
    genre: string;
    startDate?: Date;
    endDate?: Date;
}

export const fetchStoredTracks = async ({
    genre,
    startDate,
    endDate,
}: FetchStoredTracksProps): Promise<ScrapeTrack[] | null> => {
    const collectionRef = collection(db, "tracks");

    let q = query(collectionRef, where("genre", "==", genre), limit(100));

    const from = Timestamp.fromDate(startDate as Date);
    const to = Timestamp.fromDate(endDate as Date);

    if (startDate) {
        q = query(
            collectionRef,
            where("genre", "==", genre),
            where("releaseDate", ">=", from),
            where("releaseDate", "<=", to),
            limit(100)
        );
    }

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
        console.log(error);
        throw error;
    }
};