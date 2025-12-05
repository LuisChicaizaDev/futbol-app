/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    // ignoreBuildErrors: false, // Para produccion
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
