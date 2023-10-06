import {
    DocumentData,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAfter,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebaseInit";
import { ITrack, ReleaseTrack, UserData, UserTrack } from "../types";

interface SaveNewDocumentProps {
    collection: string;
    docId: string;
    data: any;
}

export const saveNewDocument = async ({
    collection,
    docId,
    data,
}: SaveNewDocumentProps) => {
    const docRef = doc(db, collection, docId);

    await setDoc(docRef, data);
};

interface UpdateDocumentProps {
    collection: string;
    docId: string;
    field: string;
    data: any;
}

export const updateNestedArray = async ({
    collection,
    docId,
    field,
    data,
}: UpdateDocumentProps) => {
    const docRef = doc(db, collection, docId);

    updateDoc(docRef, {
        [field]: arrayUnion(data),
    });
};

interface UpdateDocumentProps {
    collection: string;
    docId: string;
    data: any;
}

export const updateDocument = async ({
    collection,
    docId,
    field,
    data,
}: UpdateDocumentProps) => {
    const docRef = doc(db, collection, docId);

    updateDoc(docRef, {
        [field]: data,
    });
};

interface GetUserDataProps {
    userId?: string | null;
}

export const fetchUserData = async ({
    userId,
}: GetUserDataProps): Promise<UserData | null> => {
    if (userId) {
        const docRef = doc(db, "users", userId);

        return getDoc(docRef)
            .then((doc) => {
                if (doc.exists()) {
                    return doc.data() as UserData;
                } else {
                    return null;
                }
            })
            .catch((error) => {
                return error;
            });
    }

    return null;
};

export const fetchSpotifyNotFoundTracks = async (): Promise<
    ReleaseTrack[] | null
> => {
    return getDocs(collection(db, "spotifyTracksNotFound"))
        .then((querySnapshot) => {
            const tracks: ReleaseTrack[] = [];

            querySnapshot.forEach((doc) => {
                tracks.push(doc.data() as ReleaseTrack);
            });
            return tracks;
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            return null;
        });
};

interface GetStoredSpotifyTracks {
    lim: number;
    genre: string;
    lastDoc: DocumentData | null;
    userId: string | null;
    userData?: UserData | null;
}

export const fetchStoredSpotifyTracks = async ({
    lim,
    genre,
    lastDoc,
    userId,
    userData,
}: GetStoredSpotifyTracks): Promise<{
    tracks: ITrack[];
    lastDoc: DocumentData;
} | null> => {
    let interactedWith: string[];

    if (userId) {
        interactedWith =
            userData?.tracks?.map((track: UserTrack) => track.id) || [];
    }

    const collectionRef = collection(db, "spotifyTracks");

    let qu;

    if (lastDoc) {
        qu = query(
            collectionRef,
            where("genre", "==", genre),
            orderBy("id"),
            startAfter(lastDoc),
            limit(lim)
        );
    } else {
        qu = query(
            collectionRef,
            where("genre", "==", genre),
            orderBy("id"),
            limit(lim)
        );
    }

    const querySnapshot = await getDocs(qu);

    const tracks = querySnapshot.docs.map((doc) => {
        return doc.data() as ITrack;
    });

    const filteredTracks = tracks.filter((track) => {
        return !interactedWith.includes(track.id);
    });

    if (querySnapshot.docs.length > 0) {
        return {
            tracks: filteredTracks,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    }

    return null;
};

interface GetReviewStepTracksProps {
    userId: string | null;
    reviewStep: number;
    lastDoc: DocumentData | null;
    genre: string;
}

export const fetchUserTracks = async ({
    userId,
    reviewStep,
    lastDoc,
    genre,
}: GetReviewStepTracksProps): Promise<{
    tracks: ITrack[];
    lastDoc: DocumentData;
} | null> => {
    if (!userId) return null;

    const userData = await fetchUserData({ userId: userId });

    const collectionRef = collection(db, "spotifyTracks");

    const reviewStepTrackIds = userData?.tracks
        ?.filter((track) => track.step === reviewStep)
        .map((track) => track.id);

    let q;

    if (reviewStepTrackIds && reviewStepTrackIds.length > 0) {
        if (lastDoc) {
            q = query(
                collectionRef,
                where("id", "in", reviewStepTrackIds),
                where("genre", "==", genre),
                orderBy("id"),
                startAfter(lastDoc),
                limit(30)
            );
        } else {
            q = query(
                collectionRef,
                where("id", "in", reviewStepTrackIds),
                where("genre", "==", genre),
                orderBy("id"),
                limit(30)
            );
        }
    } else {
        return null;
    }

    const querySnapshot = await getDocs(q);

    const tracks = querySnapshot.docs.map((doc) => {
        return doc.data() as ITrack;
    });

    if (querySnapshot.docs.length > 0) {
        return {
            tracks: tracks,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        };
    }

    return null;
};