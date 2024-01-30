const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const ProductCategory = require("../../models/productCategory");
const Product = require("../../models/product");

const HttpError = require("../../http-error");
const Customer = require("../../models/customer");
const Vendor = require("../../models/vendor");
const Admin = require("../../models/admin");
const { translateHelper } = require("../../utils/helper");

exports.verifyToken = async (req, res, next) => {
  const { token } = req.body;

  try {
    decodedToken = jwt.verify(token, process.env.JWT);
  } catch (err) {
    if (err.message === "invalid token") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Not authenticated, Login again to perform actions.",
        401
      );
      return next(error);
    } else if (err.message === "jwt malformed") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Something went wrong #a. Please Login Again`,
        401
      );
      return next(error);
    }
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Something went wrong #b. Please Login Again`,
      401
    );
    return next(error);
  }

  if (!decodedToken) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Not authenticated, Login again to perform actions.",
      401
    );
    return next(error);
  }

  let user;

  const { id, role } = decodedToken;

  if (role === "customer") {
    try {
      user = await Customer.findById(id)
        .select("email firstName lastName contact profilePic ")
        .lean();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        422
      );
      return next(error);
    }
  } else if (role === "vendor") {
    try {
      user = await Vendor.findById(id)
        .select("email firstName lastName contact profilePic businessName")
        .lean();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        422
      );
      return next(error);
    }
  }
  if (!user) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      401
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: translateHelper(req, "Account verified."),
    ...user,
    role,
    token,
  });
};

exports.getCategoryAll = async (req, res, next) => {
  let categories;

  try {
    categories = await ProductCategory.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
          parentId: {
            $exists: false,
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$parentId", "$$id"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
            {
              $lookup: {
                from: "productcategories",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$parentId", "$$id"],
                      },
                      isActive: true,
                      isDeleted: false,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "productcategories",
                      let: {
                        id: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$parentId", "$$id"],
                            },
                            isActive: true,
                            isDeleted: false,
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                          },
                        },
                      ],
                      as: "levels",
                    },
                  },
                ],
                as: "levels",
              },
            },
          ],
          as: "levels",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          levels: 1,
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

  const categoriesArr = [];

  const categoryHelper = (categories, namesString) => {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      let label;
      if (namesString) {
        label = `${namesString} ${category.name}`;
      } else {
        label = category.name;
      }
      categoriesArr.push({ value: category._id, label });
      if (category.levels) {
        categoryHelper(category.levels, label + " >");
      }
    }
  };

  categoryHelper(categories, "");

  res.status(200).json({
    status: true,
    message: "product category fetched successfully",
    category: categoriesArr,
  });
};
