"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebaseInit";

// TODO error handling
export const LoginUser = (
    email: string,
    password: string,
    router: AppRouterInstance
) => {
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        router.push("/");
    });
};

export const LogOut = (router: AppRouterInstance) => {
    signOut(auth).then(() => {
        router.push("/signin");
    });
};

export const RegisterUser = (
    email: string,
    password: string,
    router: AppRouterInstance
) => {
    createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
            router.push("/");
        }
    );
};
