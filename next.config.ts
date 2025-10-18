import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "loopcraft.tech",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "loopcraft.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.loopcraft.tech",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "160.25.81.144",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
