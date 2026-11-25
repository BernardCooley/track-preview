"use client";

import { useEffect, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import { useRouter } from "next/navigation";
import AuthGuardSkeleton from "./skeletons/AuthGuardSkeleton";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const showSkeleton = useDelayedLoading(!checked || !authenticated);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                setAuthenticated(true);
            } else {
                router.replace("/");
            }
            setChecked(true);
        });
        return unsubscribe;
    }, [router]);

    if (!checked || !authenticated) {
        return showSkeleton ? <AuthGuardSkeleton /> : null;
    }

    return <>{children}</>;
};

export default AuthGuard;
