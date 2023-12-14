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
    getAuth,
    updateEmail,
    updatePassword,
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

export const LogOut = async (
    router: AppRouterInstance,
    redirect: string = "/loginRegister?login=true"
) => {
    try {
        await signOut(auth);
        router.push(redirect);
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

export const GetCurrentUser = async (): Promise<User | null> => {
    try {
        const auth = getAuth();

        if (auth) {
            return auth.currentUser;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }

    return null;
};

export const UpdateUserEmail = async (email: string, user: User) => {
    try {
        await updateEmail(user, email);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

export const UpdateUserPassword = async (password: string, user: User) => {
    try {
        await updatePassword(user, password);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};