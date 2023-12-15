import "./styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Phoniquest",
    description: "Discover new music",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Image
                    className="page-background"
                    src="/logo_background_4x_gradient.png"
                    alt=""
                    width={100}
                    height={100}
                ></Image>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
