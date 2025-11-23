/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Get API URL from environment, default to localhost:4000
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
