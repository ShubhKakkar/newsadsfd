module.exports = (req, res, next) => {
  const language = req.headers["accept-language"];

  req.languageCode = language ?? "en";

  next();
};
