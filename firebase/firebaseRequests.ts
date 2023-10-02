import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebaseInit";
import { UserData } from "../types";

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

    try {
        return await setDoc(docRef, data);
    } catch (error) {
        return null;
    }
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

    try {
        return await updateDoc(docRef, {
            [field]: arrayUnion(data),
        });
    } catch (error) {
        return null;
    }
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

    try {
        return await updateDoc(docRef, {
            [field]: data,
        });
    } catch (error) {
        return null;
    }
};

interface GetUserDataProps {
    userId: string;
}

export const getUserData = async ({
    userId,
}: GetUserDataProps): Promise<UserData | null> => {
    const docRef = doc(db, "users", userId);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        }
    } catch (error) {
        return null;
    }
    return null;
};

export const getUnseenTrackReleaseIds = async (
    tracksInteractedWith: string[]
): Promise<number[] | null> => {
    const releaseIds: number[] = [];

    const collectionRef = collection(db, "spotifyTracks");
    const condition = where("id", "not-in", tracksInteractedWith);
    const q = query(collectionRef, condition);

    try {
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            releaseIds.push(Number(doc.data().release.discogsReleaseId));
        });

        if (releaseIds.length > 0) {
            return releaseIds;
        }
    } catch (error) {
        return null;
    }

    return null;
};
