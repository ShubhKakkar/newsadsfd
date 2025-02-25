export const API = {
  PORT:
    process.env.NODE_ENV === "development"
      ? "http://192.168.235.245:7009"
      : "https://noonmarnode.stage04.obdemo.com",
};

export const BASEURL = {
  PORT:
    process.env.NODE_ENV === "development"
      ? "http://192.168.235.245:7009"
      : "https://noonmarnode.stage04.obdemo.com",
};

export const FRONTENDURL =
  process.env.NODE_ENV === "development"
    ? "http://192.168.235.245:3000"
    : "https://noonmarssr.stage04.obdemo.com";
