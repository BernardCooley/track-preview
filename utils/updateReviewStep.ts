import {
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseInit";
import { AllReleases } from "../src/data/all-releases";

export const getIds = () => {
    return AllReleases.map((release) =>
        release.previewUrl.substring(
            release.previewUrl.indexOf("net/") + 4,
            release.previewUrl.indexOf(".ogg")
        )
    );
};

export const delayedLoop = (ids: string[]) => {
    var delay = 200;

    const processItem = async (index: number, id: string) => {
        const docRef = doc(db, "tracks", id);
        console.log('document ', index, ' of ', ids.length, ' : ', id);

        await updateDoc(docRef, {
            reviewStep: 1,
        });

        if (index < ids.length - 1) {
            setTimeout(() => {
                processItem(index + 1, ids[index]);
            }, delay);
        }
    };

    processItem(0, ids[0]);
};
