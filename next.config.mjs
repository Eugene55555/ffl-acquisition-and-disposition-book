/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
