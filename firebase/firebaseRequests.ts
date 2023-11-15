import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseInit";

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
    const trackRef = doc(db, "userTracks", trackId.toString());

    await updateDoc(trackRef, {
        reviewStep: newReviewStep,
        furthestReviewStep: furthestReviewStep,
    });
};
