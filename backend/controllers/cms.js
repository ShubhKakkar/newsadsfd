const ObjectId = require("mongoose").Types.ObjectId;

const Cms = require("../models/cms");
const HttpError = require("../http-error");
const CmsDescription = require("../models/cmsDescription");

const createSlug = (value) => value.toLowerCase().split(" ").join("-");

exports.create = async (req, res, next) => {
  let { name, title, description, subData } = req.body;

  const cms = new Cms({
    name,
    title,
    description,
    slug: createSlug(name),
  });

  try {
    await cms.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create a cms page",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => ({ ...data, cmsPage: cms._id }));

  CmsDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: "Cms Page Created Successfully",
        cms,
      })
    )
    .catch((err) => {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create a cms' language data`,
        500
      );
      return next(error);
    });
};

exports.update = async (req, res, next) => {
  const { id, title, description, data, name } = req.body;

  try {
    await Cms.findByIdAndUpdate(id, {
      title,
      description,
      name,
      slug: createSlug(name),
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not edit cms page",
      500
    );
    return next(error);
  }

  data.forEach(async (d) => {
    try {
      await CmsDescription.findByIdAndUpdate(d.id, {
        title: d.title,
        description: d.description,
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
    message: "Cms Page Updated successfully.",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, name, per_page, sortBy, order, title } = req.query;
  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  name = name ?? "";
  title = title ?? "";

  per_page = per_page ?? 10;

  let cms, totalDocuments;
  try {
    if (page == 1) {
      totalDocuments = await Cms.find({
        name: { $regex: name, $options: "i" },
        title: { $regex: title, $options: "i" },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      cms = await Cms.find({
        name: { $regex: name, $options: "i" },
        title: { $regex: title, $options: "i" },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      cms = await Cms.find({
        name: { $regex: name, $options: "i" },
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
      "Could not fetch cms pages",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Cms Pages Fetched successfully.",
    cms,
    totalDocuments,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let cms;
  try {
    cms = await Cms.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "cmsdescriptions",
          localField: "_id",
          foreignField: "cmsPage",
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
          data: {
            name: "$name",
            // description: "$description",
            // title: "$title"
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            title: "$langData.title",
            description: "$langData.description",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $first: "$data",
          },
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
      "Could not fetch cms",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Cms Page Fetched successfully.",
    cms,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Cms.findByIdAndDelete(id);
    await CmsDescription.deleteMany({ cmsPage: new ObjectId(id) });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete cms page",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Cms Page Deleted Successfully.",
    id,
  });
};

exports.getAllRemainingName = async (req, res, next) => {
  const names = ["About Us", "Terms & Conditions", "Privacy Policy"];

  let cms;
  try {
    cms = (await Cms.find({}).lean()) || [];
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch remaining page names",
      500
    );
    return next(error);
  }

  const namesTaken = cms.map((p) => p.name);

  let difference = names.filter((x) => !namesTaken.includes(x));

  res.status(200).json({
    status: true,
    message: "Names Fetched successfully.",
    names: difference,
  });
};

exports.getBySlug = async (req, res, next) => {
  const { slug } = req.params;

  const lang = req.languageCode;

  let cms;

  try {
    [cms] = await Cms.aggregate([
      {
        $match: {
          slug,
        },
      },
      {
        $lookup: {
          from: "cmsdescriptions",
          localField: "_id",
          foreignField: "cmsPage",
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
          "langData.languageCode": lang,
        },
      },
      {
        $project: {
          title: "$langData.title",
          description: "$langData.description",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch cms page",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "CMS page Fetched successfully.",
    cms,
  });
};

exports.getAllCms = async (req, res, next) => {
  const lan = req.languageCode;
  let cms;
  try {
    cms = await Cms.aggregate([
      {
        $lookup: {
          from: "cmsdescriptions",
          localField: "_id",
          foreignField: "cmsPage",
          as: "langData",
        },
      },
      {
        $match: {
          "langData.languageCode": lan,
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          data: {
            name: "$name",
            // description: "$description",
            // title: "$title"
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            title: "$langData.title",
            description: "$langData.description",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $first: "$data",
          },
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
      "Could not fetch cms",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Cms Page Fetched successfully.",
    cms,
  });
};
