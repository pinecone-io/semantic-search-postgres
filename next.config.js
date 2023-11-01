/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
}

module.exports = nextConfig
