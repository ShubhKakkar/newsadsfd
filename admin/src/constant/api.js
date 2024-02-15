export const API = {
  PORT:
    process.env.NODE_ENV === "development"
      ? "http://localhost:7008"
      : "https://noonmarnode.stage04.obdemo.com",
};

export const BASEURL = {
  PORT:
    process.env.NODE_ENV === "development"
      ? "http://localhost:7008"
      : "https://noonmarnode.stage04.obdemo.com",
};

export const FRONTENDURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://noonmarssr.stage04.obdemo.com";
