require("dotenv")
const staticData = require("./staticData.json")
// Pages supplies its repository path; local and Firebase builds use the configured default.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? staticData.pathingData.baseUrl).replace(/\/+$/, "")
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: "./build/" + process.env.NODE_ENV + "/v" + process.env.VERSION,
  images: {
    domains: ["cdn.pixabay.com"],
    loader: 'akamai',
    path: '/images'
  },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

module.exports = nextConfig
