import { User as UserProfile } from "@prisma/client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../types";

interface AuthContextProps {
    user: User | null;
    updateUser: (user: User | null) => void;
    userProfile: UserProfile | null;
    updateUserProfile: (userProfile: UserProfile | null) => void;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuthContext = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error(
            "useAuthContext has to be used within <AuthContext.Provider>"
        );
    }

    return authContext;
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const updateUser = (user: User | null) => {
        setUser(user);
    };

    const updateUserProfile = (userProfile: UserProfile | null) => {
        setUserProfile(userProfile);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                updateUser,
                userProfile,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
