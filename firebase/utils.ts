"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    User,
    UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseInit";
import { createUser, deleteUserProfile } from "@/bff/bff";

export const LoginUser = async (
    email: string,
    password: string
): Promise<UserCredential | null> => {
    try {
        const user = await signInWithEmailAndPassword(auth, email, password);
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const LogOut = async (router: AppRouterInstance) => {
    try {
        await signOut(auth);
        router.push("/loginRegister");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const RegisterUser = async (
    email: string,
    password: string
): Promise<UserCredential | null> => {
    try {
        const user = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await createUser({
            userId: user.user.uid,
        });

        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const ResetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const DeleteUser = async () => {
    try {
        const user = auth.currentUser;
        await user?.delete();

        if (user) {
            await deleteUserProfile({
                userId: user?.uid,
            });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const SendVerificationEmail = async (user: User) => {
    try {
        await sendEmailVerification(user);
    } catch (error) {
        throw error;
    }
};