"use client";

import { useEffect, useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { createCheckoutSession, getUserProfile } from "@/bff/bff";

interface Props {
    variant: "free" | "pro";
}

const PricingClient = ({ variant }: Props) => {
    const router = useRouter();
    const { userProfile, updateUserProfile } = useAuthContext();
    const { isPro } = useSubscription();
    const [loading, setLoading] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
    const [profileChecked, setProfileChecked] = useState(!!userProfile);

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user?.uid && !userProfile) {
                const profile = await getUserProfile({ userId: user.uid });
                if (profile) updateUserProfile(profile);
            }
            setProfileChecked(true);
        });
    }, []);

    const isLoggedIn = !!firebaseUser;

    if (isLoggedIn && !profileChecked) return null;

    if (variant === "free") {
        if (isPro) return null;

        if (!isLoggedIn) return null;

        return (
            <Text
                fontSize="sm"
                fontWeight="semibold"
                color="brand.textMuted"
                textAlign="center"
                py={2}
            >
                Current plan
            </Text>
        );
    }

    if (isPro) {
        return (
            <Text
                fontSize="sm"
                fontWeight="semibold"
                color="brand.textMuted"
                textAlign="center"
                py={2}
            >
                Current plan
            </Text>
        );
    }

    const handleSubscribe = async () => {
        if (!isLoggedIn) {
            router.push("/loginRegister");
            return;
        }
        if (!firebaseUser?.uid) return;
        setLoading(true);
        try {
            const result = await createCheckoutSession({ userId: firebaseUser.uid });
            if (result?.url) {
                window.location.href = result.url;
                return;
            }
        } catch {
            // fall through
        }
        setLoading(false);
    };

    return (
        <Button
            variant="primary"
            w="full"
            loading={loading}
            onClick={handleSubscribe}
        >
            Upgrade
        </Button>
    );
};

export default PricingClient;
