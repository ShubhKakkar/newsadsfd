module.exports = async (req, res, next) => {
  if (process.env.ENABLE_PAID_FEATURES == "false") {
    next();
    return;
  }

  if (req.file) {
    req.file = { ...req.file, path: req.file.key };
  } else if (req.files) {
    req.files = req.files.map((file) => ({ ...file, path: file.key }));
  }

  next();
};
