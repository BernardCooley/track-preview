import React, { createContext, ReactNode, useContext, useState } from "react";
import { UserData } from "../types";

interface AuthContextProps {
    userId: string | null;
    updateUserId: (userId: string | null) => void;
    userData: UserData | null;
    updateUserData: (userData: UserData | null) => void;
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
    const [userData, setUserData] = useState<UserData | null>(null);

    const updateUserData = (userData: UserData | null) => {
        setUserData(userData);
    };

    const [userId, setUserId] = useState<string | null>("bernard_cooley");

    const updateUserId = (userId: string | null) => {
        setUserId(userId);
    };

    return (
        <AuthContext.Provider
            value={{
                userData,
                updateUserData,
                userId,
                updateUserId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
