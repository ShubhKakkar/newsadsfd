const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

const SystemImage = require("../models/systemImage");
const HttpError = require("../http-error");

const createSlug = (value) => value.toLowerCase().split(" ").join("-");

exports.create = async (req, res, next) => {
  const { title } = req.body;

  let image = "";
  if (req.file) {
    image = req.file.destination + "/" + req.file.filename;
  }

  const systemImage = new SystemImage({
    title,
    slug: createSlug(title),
    image,
  });

  try {
    await systemImage.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create system image",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "System's Image Created Successfully",
    systemImage,
  });
};

exports.update = async (req, res, next) => {
  const { title, oldImage, id } = req.body;

  let image = oldImage;

  if (req.file?.filename) {
    image = req.file.destination + "/" + req.file.filename;

    // fs.unlink(oldImage, (err) => {
    //   if (err) {
    //     const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),
    //       "Something went wrong while updating system image",
    //       500
    //     );
    //     return next(error);
    //   }
    //   //file removed
    // });
  }

  try {
    await SystemImage.findByIdAndUpdate(id, {
      title,
      image,
      slug: createSlug(title),
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update system image",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "System's Image Updated Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, title } = req.query;
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  title = title ?? "";

  per_page = per_page ?? 10;

  let systemImages, totalDocuments;
  try {
    if (page == 1) {
      totalDocuments = await SystemImage.find({
        title: { $regex: title, $options: "i" },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      systemImages = await SystemImage.find({
        title: { $regex: title, $options: "i" },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      systemImages = await SystemImage.find({
        title: { $regex: title, $options: "i" },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch system images",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "System Images Fetched successfully.",
    systemImages,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  let systemImage;

  try {
    systemImage = await SystemImage.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete system image",
      500
    );
    return next(error);
  }

  // if (systemImage.image) {
  //   fs.unlink(systemImage.image, (err) => {
  //     if (err) {
  //       const error = new HttpError(req, new Error().stack.split("at ")[1].trim(),
  //         "Something went wrong while deleting system image",
  //         500
  //       );
  //       return next(error);
  //     }
  //     //file removed
  //   });
  // }

  try {
    await SystemImage.findByIdAndDelete(id);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete system image",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "System Image Deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let systemImage;
  try {
    systemImage = await SystemImage.findById(id).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch system image",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "System's Image Fetched Successfully",
    systemImage,
  });
};

exports.getOneFrontend = async (req, res, next) => {
  const { slug } = req.params;
  let image;
  try {
    image = await SystemImage.findOne({ slug }).select("image").lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch system image",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    image,
    message: "System's Image Fetched Successfully",
  });
};
