import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: ["192.168.31.100"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.cloudflarestream.com',
            },
        ],
    },
};

export default nextConfig;

