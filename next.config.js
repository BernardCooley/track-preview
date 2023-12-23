/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "e-cdns-images.dzcdn.net",
                port: "",
                pathname: "/images/**",
            },
        ],
    },
};

module.exports = nextConfig
