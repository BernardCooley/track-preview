import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";
import { UserData, UserTrack } from "../types";

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
    track: UserTrack;
}

export const addUserTrack = async ({
    collection,
    docId,
    track,
}: UpdateDocumentProps) => {
    const docRef = doc(db, collection, docId);

    try {
        return await updateDoc(docRef, {
            tracks: arrayUnion(track),
        });
    } catch (error) {
        return error;
    }
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
