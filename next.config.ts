import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
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
      {
        protocol: "https",
        hostname: "d12wklypp119aj.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
