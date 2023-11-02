"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebaseInit";

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
