const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  fallbacks: {
    document: '/pages/_offline.js',
  },
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
});

module.exports = withPWA({
  reactStrictMode: true,
  future: {
    webpack5: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '88minutes.xyz',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
});
