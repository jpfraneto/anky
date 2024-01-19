const Buffer = require("buffer").Buffer;

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };
    }

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "noun.pics",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.seadn.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "openseauserdata.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.seadn.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};
