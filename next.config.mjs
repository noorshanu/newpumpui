/** @type {import('next').NextConfig} */
const nextConfig = {async redirects() {
    return [
      {
        source: '/',
        destination: '/pumpfun',
        permanent: true, // Set to `true` for a 308 Permanent Redirect or `false` for a 307 Temporary Redirect
      },
    ];
  },};

export default nextConfig;
