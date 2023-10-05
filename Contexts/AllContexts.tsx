import React from "react";
import { AuthContextProvider } from "./AuthContext";
import { TracksContextProvider } from "./TracksContext";

interface Props {
    children: React.ReactNode;
}

const AllContexts = ({ children }: Props) => {
    return (
        <AuthContextProvider>
            <TracksContextProvider>{children}</TracksContextProvider>
        </AuthContextProvider>
    );
};

export default AllContexts;
