const ObjectId = require("mongoose").Types.ObjectId;

const Faq = require("../models/faq");
const HttpError = require("../http-error");
const MasterDescription = require("../models/masterDescription");

exports.create = async (req, res, next) => {
  let { subData, answer, question } = req.body;

  const newFaq = new Faq({
    question,
    answer,
  });

  try {
    await newFaq.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => ({
    ...data,
    mainPage: newFaq._id,
    key: "FAQ",
  }));

  MasterDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: "Faq Created Successfully",
      })
    )
    .catch((err) => {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create faq.`,
        500
      );
      return next(error);
    });
};

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, question, isActive } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  question = question ?? "";
  per_page = +per_page ?? 10;

  let faqs, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Faq.find({
        question: { $regex: question, $options: "i" },
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      faqs = await Faq.find({
        question: { $regex: question, $options: "i" },
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      faqs = await Faq.find({
        question: { $regex: question, $options: "i" },
        ...findData,
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
      "Could not fetch faqs.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Faqs Fetched successfully.",
    faqs,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Faq.findByIdAndDelete(id);
    await MasterDescription.deleteMany({ mainPage: ObjectId(id), key: "FAQ" });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "FAQ deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let faq;

  try {
    faq = await Faq.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            question: "$langData.question",
            answer: "$langData.answer",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          languageData: {
            $push: "$languageData",
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "FAQ fetched successfully",
    faq,
  });
};

exports.update = async (req, res, next) => {
  let { question, answer, id, subData } = req.body;

  try {
    await Faq.findByIdAndUpdate(id, { question, answer });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData.forEach(async (d) => {
    try {
      await MasterDescription.findByIdAndUpdate(d.id, {
        question: d.question,
        answer: d.answer,
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not update cms' language data",
        500
      );
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "FAQ updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Faq.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "FAQ's status changed successfully.",
    id,
    status,
  });
};

exports.getAllFaqs = async (req, res, next) => {
  const lan = req.languageCode;
  let faqs;
  try {
    faqs = await Faq.aggregate([
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $match: {
          "langData.languageCode": lan,
        },
      },
      {
        $project: {
          _id: "$langData._id",
          languageCode: "$langData.languageCode",
          question: "$langData.question",
          answer: "$langData.answer",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "FAQ fetched successfully",
    faqs,
  });
};
