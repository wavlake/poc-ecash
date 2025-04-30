import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["wavlake.com", "d12wklypp119aj.cloudfront.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wavlake.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.wavlake.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
