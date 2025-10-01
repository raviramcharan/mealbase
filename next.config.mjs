/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['res.cloudinary.com'] },
  experimental: { serverActions: { allowedOrigins: ['*'] } }
};
export default nextConfig;
