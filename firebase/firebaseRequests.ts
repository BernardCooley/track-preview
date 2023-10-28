import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebaseInit";
import { ReleaseTrack, Track } from "../types";

interface SaveNewTrackProps {
    track: Track;
}

export const saveNewTrack = async ({ track }: SaveNewTrackProps) => {
    await addDoc(collection(db, "tracks"), track);
};

interface TrackExistsProps {
    track: ReleaseTrack;
}

export const searchStoredTracks = async ({
    track,
}: TrackExistsProps): Promise<Track | null> => {
    const q = query(
        collection(db, "tracks"),
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

interface GetStoredTracksProps {
    genre: string;
    currentReviewStep: number;
    userId: string;
}

export const getStoredTracks = async ({
    genre,
    currentReviewStep,
    userId,
}: GetStoredTracksProps): Promise<Track[] | null> => {
    const q = query(
        collection(db, "tracks"),
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
    const trackRef = doc(db, "tracks", trackId);

    await updateDoc(trackRef, {
        currentReviewStep: newReviewStep,
        furthestReviewStep: furthestReviewStep,
    });
};
