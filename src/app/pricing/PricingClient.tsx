"use client";

import { useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { createCheckoutSession } from "@/bff/bff";

interface Props {
    variant: "free" | "pro";
}

const PricingClient = ({ variant }: Props) => {
    const router = useRouter();
    const { user } = useAuthContext();
    const { isPro } = useSubscription();
    const [loading, setLoading] = useState(false);

    const isLoggedIn = !!user;

    if (variant === "free") {
        if (isPro) return null;

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
        if (!user?.uid) return;
        setLoading(true);
        try {
            const result = await createCheckoutSession({ userId: user.uid });
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
