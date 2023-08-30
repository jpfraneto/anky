const withPWA = require('next-pwa')({
  webpack5: true,
  dest: 'public',
  // disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // scope: '/app',
  // sw: 'service-worker.js',
  //...
});

module.exports = withPWA({
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
