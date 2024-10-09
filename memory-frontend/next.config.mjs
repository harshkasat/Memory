/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['127.0.0.1', 'localhost'], // Allow images from local server
      },
      async rewrites() {
        return [
          {
            source: '/:path*',
            destination: '/dashboard',
          },
        ];
    }
};

export default nextConfig;
