import {
    DocumentData,
    arrayUnion,
    doc,
    getDoc,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebaseInit";

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
    return await setDoc(docRef, data);
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

    return await updateDoc(docRef, {
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

    return await updateDoc(docRef, {
        [field]: data,
    });
};

interface GetUserDataProps {
    userId: string;
}

export const getUserData = async ({
    userId,
}: GetUserDataProps): Promise<DocumentData | null> => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};
