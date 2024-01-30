const ObjectId = require("mongoose").Types.ObjectId;

const Brand = require("../models/brand");
const HttpError = require("../http-error");
// const SubProductCategory = require("../models/SubProductCategory");
const MasterDescription = require("../models/masterDescription");

exports.create = async (req, res, next) => {
  let { name, subCategories, subData } = req.body;

  try {
    const slugs = subData.map((lang) => lang.slug);

    const slugSet = new Set(slugs);

    if (slugSet.size !== slugs.length) {
      let slugErr;
      if (slugs[0] === slugs[1]) {
        slugErr = slugs[0];
      } else if (slugs[1] == slugs[2]) {
        slugErr = slugs[1];
      } else {
        slugErr = slugs[2];
      }

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Already Exist Slug: " + slugErr,
        422
      );
      return next(error);
    }

    const isSlugAlreadyExist = await MasterDescription.aggregate([
      {
        $match: {
          key: "brand",
          slug: {
            $in: subData.map((s) => s.slug),
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          let: {
            id: "$mainPage",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
              },
            },
          ],
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
        },
      },
    ]);

    if (isSlugAlreadyExist.length > 0) {
      const err =
        "Already Exist Slug(s): " +
        isSlugAlreadyExist.map((obj) => obj.slug).join(", ");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        err,
        422
      );
      return next(error);
    }

    const newBrand = new Brand({
      name,
    });

    await newBrand.save();

    subData = subData.map((data) => ({
      ...data,
      mainPage: newBrand._id,
      key: "brand",
    }));

    await MasterDescription.insertMany(subData);

    // await SubProductCategory.updateMany(
    //   {
    //     _id: {
    //       $in: subCategories.map((b) => ObjectId(b)),
    //     },
    //   },
    //   {
    //     $push: {
    //       brands: newBrand._id,
    //     },
    //   }
    // );
  } catch (err) {
    console.log("add brand error", err);
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
    message: "Brand created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, per_page, sortBy, order, name, isActive } = req.query;

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
  sortBy = sortBy ?? "createdAt";

  let brands, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Brand.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      brands = await Brand.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      brands = await Brand.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
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
      "Could not fetch brands.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Brands Fetched successfully.",
    brands,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Brand.findByIdAndUpdate(id, { isDeleted: true });
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
    message: "Brand deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let brand;

  try {
    [brand] = await Brand.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$id", "$mainPage"],
                },
                key: "brand",
              },
            },
          ],
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
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            name: "$langData.name",
            slug: "$langData.slug",
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
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Brand fetched successfully",
    brand,
  });
};

exports.update = async (req, res, next) => {
  const {
    name,
    id,
    data,
    // add, remove
  } = req.body;

  try {
    const slugs = data.map((lang) => lang.slug);

    const slugSet = new Set(slugs);

    if (slugSet.size !== slugs.length) {
      let slugErr;
      if (slugs[0] === slugs[1]) {
        slugErr = slugs[0];
      } else if (slugs[1] == slugs[2]) {
        slugErr = slugs[1];
      } else {
        slugErr = slugs[2];
      }

      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Already Exist Slug: " + slugErr,
        422
      );
      return next(error);
    }

    const isSlugAlreadyExist = await MasterDescription.aggregate([
      {
        $match: {
          key: "brand",
          mainPage: {
            $ne: new ObjectId(id),
          },
          slug: {
            $in: slugs,
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          let: {
            id: "$mainPage",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                isDeleted: false,
              },
            },
          ],
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
        },
      },
    ]);

    if (isSlugAlreadyExist.length > 0) {
      const err =
        "Already Exist Slug(s): " +
        isSlugAlreadyExist.map((obj) => obj.slug).join(", ");
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        err,
        422
      );
      return next(error);
    }

    await Brand.findByIdAndUpdate(id, { name });

    data.forEach(async (d) => {
      try {
        await MasterDescription.findByIdAndUpdate(d.id, {
          name: d.name,
        });
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Could not update brand.",
          500
        );
        return next(error);
      }
    });

    // if (add?.length > 0) {
    // await SubProductCategory.updateMany(
    //   {
    //     _id: {
    //       $in: add.map((b) => ObjectId(b)),
    //     },
    //   },
    //   {
    //     $push: {
    //       brands: id,
    //     },
    //   }
    // );
    // }

    // if (remove?.length > 0) {
    // await SubProductCategory.updateMany(
    //   {
    //     _id: {
    //       $in: remove.map((b) => ObjectId(b)),
    //     },
    //   },
    //   {
    //     $pull: {
    //       brands: id,
    //     },
    //   }
    // );
    // }
  } catch (err) {
    console.log(err, "update brand err");
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
    message: "Brand updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Brand.findByIdAndUpdate(id, {
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
    message: "Brand's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.getSubCategories = async (req, res, next) => {
  let { name } = req.query;

  name = name ?? "";

  let data;

  try {
    // data = await SubProductCategory.find({
    //   isDeleted: false,
    //   name: { $regex: name, $options: "i" },
    //   isActive: true,
    // })
    //   .sort({ createdAt: -1 })
    //   .limit(10)
    //   .select("_id name")
    //   .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product categories.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Sub Categories Fetched successfully.",
    data,
  });
};
