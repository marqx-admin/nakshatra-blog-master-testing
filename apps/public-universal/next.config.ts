const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  images: { unoptimized: true },
  allowedDevOrigins: ["*.preview.localhost"],
};

export default nextConfig;
