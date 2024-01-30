/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "192.168.235.200",
      "192.168.235.200:7008",
      "http://192.168.235.200:7008",
      "noonmarnode.stage04.obdemo.com",
      "https://noonmarnode.stage04.obdemo.com",
    ],
  },
  optimizeFonts: true,
  reactStrictMode: false,
  i18n: {
    locales: ["en", "ar", "tr"],
    defaultLocale: "ar",
    localeDetection: false,
  },
  swcMinify: false,
};

module.exports = nextConfig;
