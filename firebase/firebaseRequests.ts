import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";

export const saveNewDocument = async (
    collection: string,
    docId: string,
    data: any
) => {
    const docRef = doc(db, collection, docId);
    return await setDoc(docRef, data);
};

export const updateNestedArray = async (
    collection: string,
    docId: string,
    field: string,
    data: any
) => {
    const docRef = doc(db, collection, docId);

    return await updateDoc(docRef, {
        [field]: arrayUnion(data),
    });
};
