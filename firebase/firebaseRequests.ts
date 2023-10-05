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
import { ITrack, ReleaseTrack, UserData } from "../types";

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

    setDoc(docRef, data).then(() => {
        console.log("Document successfully written!");
    });
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
    }).then(() => {
        console.log("Document successfully updated!");
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
    }).then(() => {
        console.log("Document successfully updated!");
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

interface GetUnseenTrackReleaseIdsProps {
    tracksInteractedWith: string[];
}

export const fetchUnseenTrackReleaseIds = async ({
    tracksInteractedWith,
}: GetUnseenTrackReleaseIdsProps): Promise<number[] | null> => {
    const releaseIds: number[] = [];

    const collectionRef = collection(db, "spotifyTracks");
    const condition = where("id", "not-in", tracksInteractedWith);
    const q = query(collectionRef, condition);

    return getDocs(q)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                releaseIds.push(Number(doc.data().release.discogsReleaseId));
            });

            if (releaseIds.length > 0) {
                return releaseIds;
            } else {
                return null;
            }
        })
        .catch((error) => {
            return null;
        });
};

export const fetchSpotifyNotFoundTracks = async (): Promise<
    ReleaseTrack[] | null
> => {
    return getDocs(collection(db, "spotifyTracksNotFound"))
        .then((querySnapshot) => {
            const tracks: ReleaseTrack[] = [];

            querySnapshot.forEach((doc) => {
                tracks.push(doc.data() as ReleaseTrack);
                console.log(doc.id, " => ", doc.data());
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
    interactedWith: string[];
    lastDoc: DocumentData | null;
}

export const fetchStoredSpotifyTracks = async ({
    lim,
    genre,
    interactedWith,
    lastDoc,
}: GetStoredSpotifyTracks): Promise<{
    tracks: ITrack[];
    lastDoc: DocumentData;
} | null> => {
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