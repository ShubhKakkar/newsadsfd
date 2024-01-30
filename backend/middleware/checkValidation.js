const { validationResult } = require("express-validator");
const { ErrorMessageHandler } = require("../utils/helper");

module.exports = (req, res, next) => {
  const language = req.headers["accept-language"];

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const Err = errors.array();
    const { Errors, message } = ErrorMessageHandler(Err, language);
    return res
      .status(422)
      .json({ status: "error", data: {}, errors: Errors, message });
    // const error = new HttpError(JSON.stringify(Errors), 422);
    // return next(error);
  } else {
    next();
  }
};
