/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output standalone for docker/serverless
    output: 'standalone',
    reactCompiler: true,
};

module.exports = nextConfig;
