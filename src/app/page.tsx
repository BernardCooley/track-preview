"use client";

import { Center, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/review");
    }, []);

    return (
        <main></main>
    );
}
