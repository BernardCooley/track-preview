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
    limit,
    query,
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
        throw error;
    }
};

export const LogOut = async (router: AppRouterInstance) => {
    try {
        await signOut(auth);
        router.push("/signin");
    } catch (error) {
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
        throw error;
    }
};

export const getUserTracksQuery = (
    userId: string,
    reviewStep: number,
    genre?: string
): Query<DocumentData, DocumentData> => {
    const collectionRef = collection(db, "userTracks");
    const whereUserId = where("userId", "==", userId);
    const whereCurrentReviewStep = where("currentReviewStep", "==", reviewStep);

    if (genre && genre !== "all") {
        return query(
            collectionRef,
            whereCurrentReviewStep,
            whereUserId,
            where("genre", "==", genre)
        );
    }

    return query(collectionRef, whereUserId, whereCurrentReviewStep);
};

export const getStoredTracksQuery = (
    genre: string | undefined,
    startYear: number | undefined,
    endYear: number | undefined
): Query<DocumentData, DocumentData> => {
    const collectionRef = collection(db, "tracks");
    const whereGenre = where("genre", "==", genre);
    const whereStartYear = where("releaseYear", ">=", Number(startYear));
    const whereEndYear = where("releaseYear", "<=", Number(endYear));

    if (genre && genre !== "all") {
        return query(collectionRef, whereGenre, limit(100));
    }

    if (startYear && (!genre || genre === "all")) {
        return query(collectionRef, whereStartYear, whereEndYear, limit(100));
    }

    if (startYear && genre && genre !== "all") {
        return query(
            collectionRef,
            whereGenre,
            whereStartYear,
            whereEndYear,
            limit(100)
        );
    }

    return query(collectionRef, limit(100));
};