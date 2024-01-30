const Currency = require("../../models/currency");

const HttpError = require("../../http-error");

exports.getAll = async (req, res, next) => {
  let currencies;
  try {
    currencies = await Currency.find({ isActive: true, isDeleted: false })
      .select("-isDeleted -isActive -createdAt -updatedAt -__v")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching currencies.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Currencies has been fetched successfully.",
    data: currencies,
  });
};
