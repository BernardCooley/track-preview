import React from "react";
import { AuthContextProvider } from "./AuthContext";
import { ExperimentProvider } from "@/context/ExperimentContext";

interface Props {
    children: React.ReactNode;
}

const AllContexts = ({ children }: Props) => {
    return (
        <AuthContextProvider>
            <ExperimentProvider>{children}</ExperimentProvider>
        </AuthContextProvider>
    );
};

export default AllContexts;
