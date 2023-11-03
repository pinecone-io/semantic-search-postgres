/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',     
  experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
}

module.exports = nextConfig
