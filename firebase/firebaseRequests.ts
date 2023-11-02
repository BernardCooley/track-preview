import {
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
import { ReleaseTrack, ScrapeTrack, Track } from "../types";

interface SaveNewTrackProps {
    track: Track;
}

export const saveNewTrack = async ({ track }: SaveNewTrackProps) => {
    await addDoc(collection(db, "userTracks"), track);
};

interface TrackExistsProps {
    track: ReleaseTrack;
}

export const searchStoredTracks = async ({
    track,
}: TrackExistsProps): Promise<Track | null> => {
    const q = query(
        collection(db, "userTracks"),
        where("title", "==", track.title),
        where("artist", "==", track.artist)
    );

    const querySnapshot = await getDocs(q as any);

    const tracks = querySnapshot.docs.map((doc) => doc.data()) as Track[];

    if (tracks.length > 0) {
        return tracks[0];
    }

    return null;
};

interface GetUserTracksProps {
    genre: string;
    currentReviewStep: number;
    userId: string;
}

export const getUserTracks = async ({
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

    const querySnapshot = await getDocs(q as any);

    const tracks = querySnapshot.docs.map((doc) => {
        return { ...(doc.data() as Track), id: doc.id };
    }) as Track[];

    if (tracks.length > 0) {
        return tracks;
    }

    return null;
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
    const collectionRef = collection(db, "scrapedTracks");

    let q = query(collectionRef, where("genre", "==", genre), limit(100));

    if (startDate) {
        q = query(
            collectionRef,
            where("genre", "==", genre),
            where("releaseDate", ">=", startDate),
            where("releaseDate", "<=", endDate),
            limit(100)
        );
    }

    const querySnapshot = await getDocs(q as any);

    const tracks = querySnapshot.docs.map((doc) => {
        return { ...(doc.data() as ScrapeTrack), id: doc.id };
    }) as ScrapeTrack[];

    if (tracks.length > 0) {
        return tracks;
    }

    return null;
};