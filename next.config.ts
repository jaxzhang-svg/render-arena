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
    serverExternalPackages: [
        'jsdom',
    ],
    transpilePackages: [
        'isomorphic-dompurify',
        '@exodus/bytes',
    ],
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; media-src 'self' blob: data: https://*.cloudflarestream.com; font-src 'self'; connect-src 'self' https:; frame-src 'self' blob: data: https://*.cloudflarestream.com;",
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

