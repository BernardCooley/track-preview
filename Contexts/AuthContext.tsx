import React, { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextProps {
    userId: string | null;
    updateUserId: (userId: string | null) => void;
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
    const [userId, setUserId] = useState<string | null>("bernard_cooley");

    const updateUserId = (userId: string | null) => {
        setUserId(userId);
    };

    return (
        <AuthContext.Provider
            value={{
                userId,
                updateUserId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
