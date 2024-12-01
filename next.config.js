/** @type {import('next').NextConfig} */
const nextConfig = {
    // You can enable production optimizations here if needed
    reactStrictMode: true,  // Ensures React's Strict Mode is enabled, which can help catch potential issues
  
    // Optionally, add custom Webpack configuration if needed (e.g., disabling Jest in production builds)
    webpack(config, { dev, isServer }) {
      if (!dev && !isServer) {
        // Disable Jest or testing-related configurations in production (if any exist)
        console.log('Production mode, disabling tests or Jest-related configurations...');
      }
      return config;
    }
  };
  
  module.exports = nextConfig;
  