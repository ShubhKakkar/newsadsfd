const ObjectId = require("mongoose").Types.ObjectId;

const EmailTemplate = require("../models/emailTemplate");
const HttpError = require("../http-error");
const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

exports.create = async (req, res, next) => {
  const { name, subject, action, body } = req.body;

  const emailTemplate = new EmailTemplate({
    name,
    subject,
    action,
    body,
  });

  try {
    await emailTemplate.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create an email template",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Email Template Created Successfully",
    emailTemplate,
  });
};

exports.getAll = async (req, res, next) => {
  let { page, subject, per_page, sortBy, order, name } = req.query;
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  if (!subject) {
    subject = "";
  }

  if (!name) {
    name = "";
  }

  per_page = +per_page ?? 10;

  let emailTemplates, totalDocuments;

  const MATCH = {
    $match: {
      subject: new RegExp(subject, "i"),
      name: new RegExp(name, "i"),
    },
  };

  const PROJECT = {
    $project: {
      name: 1,
      subject: 1,
      createdAt: 1,
    },
  };

  try {
    if (page == 1) {
      totalDocuments = await EmailTemplate.find({
        subject: { $regex: subject, $options: "i" },
        name: { $regex: name, $options: "i" },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      emailTemplates = await EmailTemplate.aggregate([
        MATCH,
        SORT(sortBy, order),
        LIMIT(per_page),
        PROJECT,
      ]);
    } else {
      emailTemplates = await EmailTemplate.aggregate([
        MATCH,
        SORT(sortBy, order),
        SKIP(page, per_page),
        LIMIT(per_page),
        PROJECT,
      ]);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email templates",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Email Templates Fetched successfully.",
    emailTemplates,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let emailTemplate;
  try {
    emailTemplate = await EmailTemplate.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "emailactions",
          localField: "action",
          foreignField: "_id",
          as: "actionData",
        },
      },
      {
        $unwind: {
          path: "$actionData",
        },
      },
      {
        $project: {
          name: 1,
          subject: 1,
          body: 1,
          constants: "$actionData.constants",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch email template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Email Template Fetched successfully.",
    emailTemplate,
  });
};

exports.update = async (req, res, next) => {
  const { body, name, subject, id } = req.body;

  try {
    await EmailTemplate.findByIdAndUpdate(id, { body, name, subject });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update email template",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Email Templates Updated successfully.",
  });
};
