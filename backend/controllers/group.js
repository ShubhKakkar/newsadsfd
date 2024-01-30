const ObjectId = require("mongoose").Types.ObjectId;

const Group = require("../models/group");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  const { group } = req.params;
  const { name, members } = req.body;

  const newGroup = new Group({
    name,
    members,
    type: group,
  });

  try {
    await newGroup.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Group Created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, name, isActive } = req.query;

  let { group } = req.params;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  name = name ?? "";
  per_page = +per_page ?? 10;

  let groups, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Group.find({
        name: { $regex: name, $options: "i" },
        type: { $regex: group, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      groups = await Group.find({
        name: { $regex: name, $options: "i" },
        type: { $regex: group, $options: "i" },
        ...findData,
        isDeleted: false,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      groups = await Group.find({
        name: { $regex: name, $options: "i" },
        type: { $regex: group, $options: "i" },
        ...findData,
        isDeleted: false,
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
      "Could not fetch groups.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Groups Fetched successfully.",
    groups,
    totalDocuments,
  });
};

const typeModels = {
  vendor: "vendors",
  customer: "customers",
  country: "countries",
  product: "products",
  supplier: "manufactures",
};

exports.getOne = async (req, res, next) => {
  const { id, group } = req.params;

  const models = typeModels[group];

  const pipeline = [
    {
      $match: {
        _id: new ObjectId(id),
        type: group,
      },
    },
    {
      $lookup: {
        from: models,
        let: {
          ids: "$members",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$ids"],
              },
              isDeleted: false,
            },
          },
          {
            $project: {
              label:
                group == "vendor"
                  ? "$businessName"
                  : group == "customer"
                  ? {
                      $concat: ["$firstName", " ", "$lastName"],
                    }
                  : "$name",
              value: "$_id",
              _id: 0,
            },
          },
        ],
        as: "members",
      },
    },
  ];

  let data;

  try {
    [data] = await Group.aggregate(pipeline);
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
    message: "Group fetched successfully",
    data,
  });
};

exports.update = async (req, res, next) => {
  let { group } = req.params;
  let { members, id, name } = req.body;

  try {
    await Group.findByIdAndUpdate(id, {
      $set: {
        members,
        name,
        type: group,
      },
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
    message: "Group's updated successfully",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Group.findByIdAndUpdate(id, {
      isDeleted: true,
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
    message: "Group deleted Successfully",
    id,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Group.findByIdAndUpdate(id, {
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
    message: "Group's status changed successfully.",
    id,
    status,
  });
};

exports.getAllInLabelValue = async (req, res, next) => {
  let { name } = req.query;

  let { group } = req.params;

  name = name ?? "";

  let groups;

  try {
    groups = await Group.aggregate([
      {
        $match: {
          name: new RegExp(name, "i"),
          type: group,
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          _id: 0,
          label: "$name",
          value: "$_id",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch groups.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Groups Fetched successfully.",
    groups,
  });
};
