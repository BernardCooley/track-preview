import React from "react";
import { AuthContextProvider } from "./AuthContext";

interface Props {
    children: React.ReactNode;
}

const AllContexts = ({ children }: Props) => {
    return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default AllContexts;
