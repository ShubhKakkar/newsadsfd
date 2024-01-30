const ContactUs = require("../models/contactUs");
const HttpError = require("../http-error");

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, email } = req.query;

  email = email ?? "";
  page = page ? +page : 1;
  per_page = per_page ? +per_page : 10;
  sortBy = sortBy ?? "createdAt";

  const commomPipe = [
    {
      $match: {
        email: {
          $regex: email,
          $options: "i",
        },
      },
    },
  ];

  paginationPIpe = [
    {
      $sort: {
        [sortBy]: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
  ];

  let contactUs, totalDocuments;
  try {
    contactUs = await ContactUs.aggregate([...commomPipe, ...paginationPIpe]);
    totalDocuments = await ContactUs.aggregate([...commomPipe]);
    totalDocuments = totalDocuments.length;
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching the data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Data fetched successfully.",
    contactUs,
    totalDocuments,
  });
};

exports.getOne = async (req, res, next) => {
  let { id } = req.params;

  let contactUs;
  try {
    contactUs = await ContactUs.findOne({ _id: id }).lean();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching the data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Data fetched successfully.",
    contactUs,
  });
};
