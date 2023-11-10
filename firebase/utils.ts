"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth, db } from "./firebaseInit";
import {
    DocumentData,
    Query,
    collection,
    getDocs,
    limit,
    query,
    startAt,
    where,
} from "firebase/firestore";

export const LoginUser = async (
    email: string,
    password: string,
    router: AppRouterInstance
) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const LogOut = async (router: AppRouterInstance) => {
    try {
        await signOut(auth);
        router.push("/signin");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const RegisterUser = async (
    email: string,
    password: string,
    router: AppRouterInstance
) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getUserTracksQuery = (
    userId: string,
    reviewStep?: number,
    genre?: string
): Query<DocumentData, DocumentData> => {
    const collectionRef = collection(db, "userTracks");
    const whereUserId = where("userId", "==", userId);
    const whereCurrentReviewStep = where("currentReviewStep", "==", reviewStep);
    const whereGenre = where("genre", "==", genre);

    if (genre && genre !== "all") {
        return query(collectionRef, whereUserId, whereGenre);
    }

    if (genre && genre !== "all" && reviewStep) {
        return query(
            collectionRef,
            whereCurrentReviewStep,
            whereUserId,
            whereGenre
        );
    }

    if (reviewStep) {
        return query(collectionRef, whereUserId);
    }

    return query(collectionRef, whereUserId, whereCurrentReviewStep);
};

export const getListenedTracksQuery = (
    userId: string,
    genre?: string
): Query<DocumentData, DocumentData> => {
    const collectionRef = collection(db, "listenedTracks");
    const whereUserIdExists = where("userIds", "array-contains", userId);
    const whereGenre = where("genre", "==", genre);

    if (genre && genre !== "all") {
        return query(collectionRef, whereGenre, whereUserIdExists);
    }

    return query(collectionRef, whereUserIdExists);
};

export const getStoredTracksQuery = (
    genre: string | undefined,
    startYear: number | undefined,
    endYear: number | undefined,
    startFromId: string | null
): Query<DocumentData, DocumentData> => {
    const collectionRef = collection(db, "tracks");
    const whereGenre = where("genre", "==", genre);
    const whereStartYear = where("releaseYear", ">=", Number(startYear));
    const whereEndYear = where("releaseYear", "<=", Number(endYear));
    const startFrom = startAt(startFromId);

    if (startYear && genre && genre !== "all") {
        return query(
            collectionRef,
            whereStartYear,
            whereGenre,
            whereEndYear,
            startFrom,
            limit(100)
        );
    }

    if (startYear && (!genre || genre === "all")) {
        return query(
            collectionRef,
            whereStartYear,
            whereEndYear,
            startFrom,
            limit(100)
        );
    }

    if (genre && genre !== "all") {
        return query(collectionRef, whereGenre, startFrom, limit(100));
    }

    return query(collectionRef, startFrom, limit(100));
};

export const getAllTrackIds = async (): Promise<string[]> => {
    try {
        const collectionRef = collection(db, "tracks");
        const querySnapshot = await getDocs(collectionRef);
        const tracksIds = querySnapshot.docs.map((doc) => {
            return doc.id;
        });

        return tracksIds;
    } catch (error) {
        console.error(error);
        throw error;
    }
};