// Next.js configuration

const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverActions: {
    allowedOrigins: ['shopping.barrosoportal.com', 'localhost:3056', 'localhost:3000'],
  }
};

export default nextConfig;
