import type { NextConfig } from "next";
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

const nextConfig: NextConfig = {
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'host',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          discovery: `discovery@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
        exposes: {},
        shared: {
          // your shared dependencies
        },
      })
    );

    return config;
  },
};

export default nextConfig;
