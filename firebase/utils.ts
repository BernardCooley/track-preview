"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    EmailAuthProvider,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    User,
    UserCredential,
    getAuth,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "./firebaseInit";
import { deleteUserProfile } from "@/bff/bff";

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
    const user = auth.currentUser;
    if (!user) throw new Error("No current user");

    await deleteUserProfile({ userId: user.uid });
    await user.delete();
    await signOut(auth);
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

export const ReauthenticateUser = async (user: User, currentPassword: string) => {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
};

export const UpdateUserPassword = async (currentPassword: string, newPassword: string, user: User) => {
    await ReauthenticateUser(user, currentPassword);
    await updatePassword(user, newPassword);
};