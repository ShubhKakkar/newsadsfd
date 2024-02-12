const ObjectId = require("mongoose").Types.ObjectId;

const ProductCategory = require("../../models/productCategory");
const HttpError = require("../../http-error");
const { translateHelper } = require("../../utils/helper");
const { default: mongoose } = require("mongoose");
// const Category = require("../../models/category");

exports.getAll = async (req, res, next) => {
  let categories;
  try {
    categories = await ProductCategory.find({
      isActive: true,
      isDeleted: false,
    })
      .select("-isDeleted -isActive")
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching product categories.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product categories has been fetched successfully.",
    data: categories,
  });
};

exports.productCategoriesByCountry = async (req, res, next) => {
  const { ids } = req.body;

  const countriesId = ids.map((id) => new ObjectId(id));

  let productCategories;

  const language = "en";

  try {
    productCategories = await ProductCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          parentId: {
            $exists: false,
          },
          // country: {
          //       $in: countriesId,
          //     },
        },
      },
      {
        $lookup: {
          from: "productcategorydescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$productCategoryId", "$$id"],
                    },
                    languageCode: language,
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
                slug: 1,
                metaData: 1,
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
        $sort: {
          order: 1,
        },
      },
      {
        $project: {
          name: "$langData.name",
          image: 1,
          slug: "$langData.slug",
          subCategories: 1,
          metaData: "$langData.metaData",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: translateHelper(req, "Product categoires fatched successfully."),
    status: true,
    productCategories,
  });
};

exports.getAllByCountryOld = async (req, res, next) => {
  const countryId = req.countryId;

  let categories;

  const language = req.languageCode;

  try {
    categories = await ProductCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          // country: {
          //   $in: [new ObjectId(countryId)],
          // },
          parentId: {
            $exists: false,
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            parentId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$parentId", "$$parentId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isActive", true],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productcategories",
                let: {
                  parentId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$parentId", "$$parentId"],
                          },
                        },
                        {
                          $expr: {
                            $eq: ["$isActive", true],
                          },
                        },
                        {
                          $expr: {
                            $eq: ["$isDeleted", false],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: "productcategorydescriptions",
                      let: {
                        id: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $and: [
                              {
                                $expr: {
                                  $eq: ["$productCategoryId", "$$id"],
                                },
                                languageCode: language,
                              },
                            ],
                          },
                        },
                        {
                          $project: {
                            _id: 0,
                            name: 1,
                            slug: 1,
                            metaData: 1,
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
                      name: "$langData.name",
                      // slug: "$langData.slug",
                      metaData: "$langData.metaData",
                      image: 1,
                      order: 1,
                    },
                  },
                  {
                    $sort: {
                      order: 1,
                    },
                  },
                ],
                as: "subCategories",
              },
            },
            {
              $lookup: {
                from: "productcategorydescriptions",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$productCategoryId", "$$id"],
                          },
                          languageCode: language,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 1,
                      slug: 1,
                      metaData: 1,
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
                name: "$langData.name",
                slug: "$langData.slug",
                metaData: "$langData.metaData",
                image: 1,
                order: 1,
                subCategories: 1,
              },
            },
            {
              $sort: {
                order: 1,
              },
            },
          ],
          as: "subCategories",
        },
      },
      // {
      //   $addFields: {
      //     subCategoriesLength: {
      //       $size: "$subCategories",
      //     },
      //   },
      // },
      // {
      //   $match: {
      //     subCategoriesLength: {
      //       $gt: 0,
      //     },
      //   },
      // },
      {
        $lookup: {
          from: "productcategorydescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$productCategoryId", "$$id"],
                    },
                    languageCode: language,
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
                slug: 1,
                metaData: 1,
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
        $sort: {
          order: 1,
        },
      },
      {
        $project: {
          name: "$langData.name",
          image: 1,
          slug: "$langData.slug",
          subCategories: 1,
          metaData: "$langData.metaData",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: translateHelper(req, "Categories fetched successfully."),
    status: true,
    categories,
  });
};

exports.getChildCategories = async (req, res, next) => {
  const { ids, id } = req.body;

  let category, categories;

  try {
    if (id) {
      category = ProductCategory.aggregate([
        {
          $match: {
            parentId: new ObjectId(id),
            isActive: true,
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "productcategorydescriptions",
            let: {
              productCategoryId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productCategoryId", "$$productCategoryId"],
                  },
                  languageCode: req.languageCode,
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
            name: "$langData.name",
          },
        },
      ]);
      // category = Category.aggregate([
      //   {
      //     $match: {
      //       parentId: new ObjectId(id),
      //       isActive: true,
      //       isDeleted: false,
      //     },
      //   },
      //   {
      //     $project: {
      //       name: 1,
      //     },
      //   },
      // ]);
    }

    if (ids) {
      // categories = Category.aggregate([
      //   {
      //     $match: {
      //       parentId: {
      //         $in: ids.map((id) => new ObjectId(id)),
      //       },
      //       isActive: true,
      //       isDeleted: false,
      //     },
      //   },
      //   {
      //     $project: {
      //       name: 1,
      //     },
      //   },
      // ]);
    }

    [category, categories] = await Promise.all([category, categories]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch categories.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Categories fetched successfully.",
    category,
    categories,
    ids,
    id,
  });
};

exports.getAllByCountry = async (req, res, next) => {
  const language = req.languageCode;

  const productCategories = await ProductCategory.aggregate([
    {
      $match: {
        parentId: {
          $exists: false,
        },
        isDeleted: false,
        isActive: true,
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
    {
      $limit: 7,
    },
    {
      $lookup: {
        from: "productcategorydescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$productCategoryId", "$$id"],
                  },
                  languageCode: language,
                },
              ],
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
              slug: 1,
              metaData: 1,
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
      $graphLookup: {
        from: "productcategories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        as: "subCategories",
        maxDepth: 5,
        depthField: "level",
        restrictSearchWithMatch: {
          isDeleted: false,
          isActive: true,
        },
      },
    },
    {
      $unwind: {
        path: "$subCategories",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "productcategorydescriptions",
        let: {
          id: "$subCategories._id",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$productCategoryId", "$$id"],
                  },
                  languageCode: language,
                },
              ],
            },
          },
          {
            $project: {
              _id: 0,
              name: 1,
              slug: 1,
              metaData: 1,
            },
          },
        ],
        as: "subCategoriesLangData",
      },
    },
    {
      $unwind: {
        path: "$subCategoriesLangData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "subCategories.langData": "$subCategoriesLangData",
      },
    },
    {
      $sort: {
        "subCategories.level": -1,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        order: 1,
        langData: 1,
        subCategories: {
          _id: 1,
          name: "$subCategoriesLangData.name",
          image: 1,
          slug: "$subCategoriesLangData.slug",
          metaData: "$subCategoriesLangData.metaData",
          order: 1,
          level: 1,
          parentId: 1,
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        name: {
          $first: "$langData.name",
        },
        slug: {
          $first: "$langData.slug",
        },
        metaData: {
          $first: "$langData.metaData",
        },
        order: {
          $first: "$order",
        },
        subCategories: {
          $push: "$subCategories",
        },
      },
    },
    {
      $addFields: {
        subCategories: {
          $cond: [
            {
              $size: {
                $objectToArray: {
                  $first: "$subCategories",
                },
              },
            },
            "$subCategories",
            [],
          ],
        },
      },
    },
    {
      $addFields: {
        subCategories: {
          $reduce: {
            input: "$subCategories",
            initialValue: {
              level: -1,
              presentChild: [],
              prevChild: [],
            },
            in: {
              $let: {
                vars: {
                  prev: {
                    $cond: [
                      {
                        $eq: ["$$value.level", "$$this.level"],
                      },
                      "$$value.prevChild",
                      "$$value.presentChild",
                    ],
                  },
                  current: {
                    $cond: [
                      {
                        $eq: ["$$value.level", "$$this.level"],
                      },
                      "$$value.presentChild",
                      [],
                    ],
                  },
                },
                in: {
                  level: "$$this.level",
                  prevChild: "$$prev",
                  presentChild: {
                    $concatArrays: [
                      "$$current",
                      [
                        {
                          $mergeObjects: [
                            "$$this",
                            {
                              subCategories: {
                                $filter: {
                                  input: "$$prev",
                                  as: "e",
                                  cond: {
                                    $eq: ["$$e.parentId", "$$this._id"],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      ],
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        subCategories: "$subCategories.presentChild",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);

  res.status(200).json({
    message: translateHelper(req, "Categories fetched successfully."),
    status: true,
    categories: productCategories,
  });
};
