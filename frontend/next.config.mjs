/** @type {import('next').NextConfig} */
const nextConfig = {
  // Green IT: si se agregan imágenes con next/image se sirven en AVIF/WebP
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
