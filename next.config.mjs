/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false, tls: false, fs: false,
        http2: false, dns: false, child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
