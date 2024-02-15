const ObjectId = require("mongoose").Types.ObjectId;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const parser = require("xml2json");

const HttpError = require("../../http-error");
const Product = require("../../models/product");
const ProductVariant = require("../../models/productVariant");
const Variant = require("../../models/variant");
const Vendor = require("../../models/vendor");
const Unit = require("../../models/unit");
// const SubProductCategory = require("../../models/SubProductCategory");
const Currency = require("../../models/currency");
const {
  translateHelper,
  languages,
  findKeyPath,
  currentAndUSDCurrencyData,
  isParentCategoriesActive,
  getChildCategories,
  getAllCategories,
} = require("../../utils/helper");
const { PRODUCT_PRICING, REVIEW_AGG } = require("../../utils/aggregate");
const idCreator = require("../../utils/idCreator");
const ProductCategory = require("../../models/productCategory");
const Brand = require("../../models/brand");
const Setting = require("../../models/setting");
const MasterDescription = require("../../models/masterDescription");
const Customer = require("../../models/customer");
// const Category = require("../../models/category");
const ProductCategoryDescription = require("../../models/productCategoryDescription");
const ProductVariantDescription = require("../../models/productVariantDescription");
const ProductDescription = require("../../models/productDescription");
const VendorProduct = require("../../models/vendorProduct");
const VendorProductVariant = require("../../models/vendorProductVariant");
const ShippingCompany = require("../../models/shippingCompany");
const SubSpecificationGroupValue = require("../../models/subSpecificationGroupValue");
const Review = require("../../models/review");
const OrderItem = require("../../models/orderItem");

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
  "audio/ogg",
];

const COMMON_AGG = [
  {
    $match: {
      $or: [
        {
          $and: [
            {
              $expr: {
                $gt: [
                  {
                    $size: "$variants",
                  },
                  0,
                ],
              },
            },
          ],
        },
        {
          $and: [
            {
              $expr: {
                $eq: [
                  {
                    $size: "$variants",
                  },
                  0,
                ],
              },
            },
          ],
        },
      ],
    },
  },
  {
    $sort: {
      "vendorData.createdAt": 1,
    },
  },
  {
    $group: {
      _id: {
        $cond: [
          "$variantData",
          {
            $concat: [{ $toString: "$_id" }, { $toString: "$variantData._id" }],
          },
          {
            $concat: [{ $toString: "$_id" }, { $toString: "$vendorData._id" }],
          },
        ],
      },
      doc: {
        $first: "$$ROOT",
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: "$doc",
    },
  },
];

//updated
exports.getAll = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.userId;

  let {
    onSale = false,
    // subCategories = [],
    brands = [],
    minPrice,
    maxPrice,
    ratings,
    minDiscount,
    maxDiscount,
    // inStock,
    // outOfStock,
    page,
    sortBy, // priceAsc, priceDesc, new
    dynamicFilters = [],
    category,
    perPage = 30,
    // childCategories = [],
    dynamicSpecifications = [],
  } = req.body;

  if (!page) {
    page = 1;
  }

  perPage = +perPage;

  if (!category) {
    return res.status(200).json({
      status: false,
      message: "Please provide category.",
    });
  }

  let sortByKey = "createdAt";
  let sortByValue = 1;

  if (sortBy === "priceAsc") {
    sortByKey = "discountedPrice";
    sortByValue = 1;
  } else if (sortBy === "priceDesc") {
    sortByKey = "discountedPrice";
    sortByValue = -1;
  }

  let matchObj = {
    isDeleted: false,
  };

  let matchObjTwo = {};

  if (onSale) {
    matchObjTwo.discountPercentage = {
      $gt: 0,
    };
  }

  // if (subCategories.length > 0) {
  //   matchObj.subCategoryId = {
  //     $in: subCategories.map((sc) => ObjectId(sc)),
  //   };

  //   if (childCategories.length > 0) {
  //     matchObj.categoriesId = {
  //       $in: childCategories.map((sc) => ObjectId(sc)),
  //     };
  //   }
  // }

  if (brands.length > 0) {
    matchObj.brandId = {
      $in: brands.map((brand) => ObjectId(brand)),
    };
  }

  if (minPrice && maxPrice) {
    //discountedPrice
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
      $lte: +maxPrice,
    };
  } else if (minPrice) {
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
    };
  } else if (maxPrice) {
    matchObjTwo.discountedPrice = {
      $lte: +maxPrice,
    };
  }

  if (ratings) {
    matchObjTwo.ratings = +ratings;
  }

  if (minDiscount && maxDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
      $lte: +maxDiscount,
    };
  } else if (minDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
    };
  } else if (maxDiscount) {
    matchObjTwo.discountPercentage = {
      $lte: +maxDiscount,
    };
  }

  // if (inStock && outOfStock) {
  //   matchObj.inStock = {
  //     $in: [true, false],
  //   };
  // } else if (inStock) {
  //   matchObj.inStock = {
  //     $in: [true],
  //   };
  // } else if (outOfStock) {
  //   matchObj.inStock = {
  //     $in: [false],
  //   };
  // }

  let DYNAMIC_FILTERS_PIPELINE = [];
  let DYNAMIC_SPECIFICATION_PIPELINE = [];

  if (dynamicFilters.length > 0) {
    const dynamicFiltersObj = {};

    for (let i = 0; i < dynamicFilters.length; i++) {
      const filter = dynamicFilters[i];

      if (dynamicFiltersObj[filter.id]) {
        dynamicFiltersObj[filter.id] = [
          ...dynamicFiltersObj[filter.id],
          filter.value,
        ];
      } else {
        dynamicFiltersObj[filter.id] = [filter.value];
      }
    }

    for (let key in dynamicFiltersObj) {
      const values = dynamicFiltersObj[key];

      const filtersAgg = [];

      values.forEach((value) => {
        filtersAgg.push({
          $and: [
            {
              "variantData.firstVariantId": ObjectId(key),
            },
            {
              "variantData.firstSubVariantName": value.toString(),
            },
          ],
        });

        filtersAgg.push({
          $and: [
            {
              "variantData.secondVariantId": ObjectId(key),
            },
            {
              "variantData.secondSubVariantName": value.toString(),
            },
          ],
        });
      });

      DYNAMIC_FILTERS_PIPELINE.push({
        $match: {
          $or: filtersAgg,
        },
      });
    }

    // for (let i = 0; i < dynamicFilters.length; i++) {
    //   const filtersAgg = [];

    //   const filter = dynamicFilters[i];

    //   DYNAMIC_FILTERS_PIPELINE.push({
    //     $match: {
    //       $or: filtersAgg,
    //     },
    //   });
    // }
  }

  const specificationAgg = [];

  if (dynamicSpecifications.length > 0) {
    for (let i = 0; i < dynamicSpecifications.length; i++) {
      const specification = dynamicSpecifications[i];

      specificationAgg.push({
        $and: [
          // {
          //   "features.id": ObjectId(specification.id),
          // },
          // {
          //   "features.value": specification.value.toString(),
          // },
          {
            "values.label": ObjectId(specification.id),
          },
          {
            "values.name": specification.value.toString(),
          },
        ],
      });
    }

    DYNAMIC_SPECIFICATION_PIPELINE = [
      {
        $lookup: {
          from: "subspecificationgroupvaluedescriptions",
          let: {
            ids: "$features.value",
            label: "$features.label",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$subSpecificationGroupValueId", "$$ids"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                subSpecificationGroupValueId: 1,
                name: 1,
                label: {
                  $arrayElemAt: ["$$label", 0],
                },
              },
            },
          ],
          as: "values",
        },
      },
      {
        $match: {
          $or: specificationAgg,
        },
      },
    ];
  }

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  let categoryFilters;

  try {
    // categoryFilters = await ProductCategory.findOne({
    //   slug: category,
    //   isActive: true,
    //   isDeleted: false,
    //   country: {
    //     $in: [new ObjectId(countryId)],
    //   },
    // })
    //   .select("variantIds _id name")
    //   .lean();

    [categoryFilters] = await ProductCategoryDescription.aggregate([
      {
        $match: {
          slug: category,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
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
        $lookup: {
          from: "productcategorydescriptions",
          let: {
            productCategoryId: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productCategoryId", "$$productCategoryId"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                _id: 0,
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
        $lookup: {
          from: "subspecificationgroups",
          let: {
            ids: "$result.specificationFilterIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $sort: {
                name: 1,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "specificationGroupsData",
        },
      },
      {
        $project: {
          _id: "$result._id",
          image: "$result.image",
          specificationFilterIds: "$result.specificationFilterIds",
          variantFilterIds: "$result.variantIds",
          name: 1,
          slug: 1,
          metaData: 1,
          langData: 1,
          specificationGroupsData: {
            $map: {
              input: "$specificationGroupsData",
              as: "item",
              in: "$$item._id",
            },
          },
          parentId: "$result.parentId",
        },
      },
    ]);
  } catch (err) {
    console.log("err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products.",
      products: [],
      totalProducts: 0,
    });
  }

  if (!categoryFilters) {
    return res.status(200).json({
      status: false,
      message: "Invalid category.",
      products: [],
      totalProducts: 0,
    });
  }

  if (categoryFilters.parentId) {
    const isParentCategoriesActiveResult = await isParentCategoriesActive(
      categoryFilters.parentId
    );

    if (!isParentCategoriesActiveResult) {
      return res.status(200).json({
        status: false,
        message: "Invalid category.",
        products: [],
        totalProducts: 0,
      });
    }
  }

  let childCategoryIds = { ids: [], secondIds: [] };

  childCategoryIds.ids = await getChildCategories(categoryFilters._id);

  // try {
  //   [childCategoryIds] = await ProductCategory.aggregate([
  //     {
  //       $match: {
  //         parentId: new ObjectId(categoryFilters._id),
  //         isActive: true,
  //         isDeleted: false,
  //       },
  //     },
  //     {
  //       $project: {
  //         id: ["$_id"],
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "productcategories",
  //         let: {
  //           id: "$_id",
  //         },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ["$parentId", "$$id"],
  //               },
  //               isActive: true,
  //               isDeleted: false,
  //             },
  //           },
  //           {
  //             $project: {
  //               _id: 1,
  //             },
  //           },
  //         ],
  //         as: "second",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "productcategories",
  //         let: {
  //           ids: "$second._id",
  //         },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $in: ["$parentId", "$$ids"],
  //               },
  //               isActive: true,
  //               isDeleted: false,
  //             },
  //           },
  //           {
  //             $project: {
  //               _id: 1,
  //             },
  //           },
  //         ],
  //         as: "third",
  //       },
  //     },
  //     {
  //       $project: {
  //         id: 1,
  //         ids: {
  //           $concatArrays: [
  //             {
  //               $map: {
  //                 input: "$second",
  //                 as: "a",
  //                 in: "$$a._id",
  //               },
  //             },
  //             {
  //               $map: {
  //                 input: "$third",
  //                 as: "b",
  //                 in: "$$b._id",
  //               },
  //             },
  //             "$id",
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: "$ids",
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: "x50",
  //         ids: {
  //           $push: "$ids",
  //         },
  //         secondIds: {
  //           $addToSet: "$_id",
  //         },
  //       },
  //     },
  //   ]);
  // } catch (err) {
  //   return res.status(200).json({
  //     status: false,
  //     message: "Could not fetch products.",
  //     products: [],
  //     totalProducts: 0,
  //     key: "childCategoryIds",
  //   });
  // }

  // if (!childCategoryIds) {
  //   childCategoryIds = {
  //     ids: [],
  //     secondIds: [],
  //   };
  // }

  const commonMatch = {
    // categoryId: ObjectId(categoryFilters._id),
    categoryId: {
      $in: [
        new ObjectId(categoryFilters._id),
        ...childCategoryIds?.ids.map((id) => new ObjectId(id)),
      ],
    },
  };

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // isVendorActive: true,
        // isHelper: false,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        ...commonMatch,
      },
    },
    {
      $sort: {
        [sortByKey]: sortByValue,
      },
    },
    {
      $skip: (+page - 1) * perPage,
    },
    {
      $limit: perPage,
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
         /*  {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          }, */
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              ],
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
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productVariantId", "$$productVariantId"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
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
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        // price: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        slug: {
          $ifNull: ["$variantData.langData.slug", "$langData.slug"],
        },
        name: {
          $cond: [
            "$variantData",
            {
              $cond: [
                "$variantData.secondVariantName",
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ",",
                    "$variantData.secondSubVariantName",
                    ")",
                  ],
                },
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ")",
                  ],
                },
              ],
            },
            "$langData.name",
          ],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        reviewsCount: 0,
        // discountPercentage: 0,
        // pricesFiltered: {
        //   $filter: {
        //     input: "$prices",
        //     cond: {
        //       $eq: ["$$item.countryId", new ObjectId(countryId)],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
        // media: {
        //   $filter: {
        //     input: "$media",
        //     cond: {
        //       $eq: ["$$item.isFeatured", true],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
      },
    },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$media",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     price: "$pricesFiltered.sellingPrice",
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //     discountPercentage: {
    //       $round: [
    //         {
    //           $subtract: [
    //             100,
    //             {
    //               $divide: [
    //                 {
    //                   $multiply: ["$pricesFiltered.discountPrice", 100],
    //                 },
    //                 "$pricesFiltered.sellingPrice",
    //               ],
    //             },
    //           ],
    //         },
    //         2,
    //       ],
    //     },
    //   },
    // },
    {
      $match: {
        ...matchObj,
      },
    },
    ...DYNAMIC_FILTERS_PIPELINE,
    {
      $addFields: {
        features: {
          $map: {
            input: "$langData.features",
            as: "item",
            in: {
              label: "$$item.label",
              value: "$$item.value",
              id: {
                $toObjectId: "$$item.id",
              },
            },
          },
        },
      },
    },
    ...DYNAMIC_SPECIFICATION_PIPELINE,
  ];

  const PRICES_COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // isVendorActive: true,
        // isHelper: false,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        ...commonMatch,
      },
    },
    //added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          // {
          //   $sort: {
          //     createdAt: 1,
          //   },
          // },
          // {
          //   $limit: 1,
          // },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    //added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          //added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        // price: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        // discountedPrice: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    // {
    //   $addFields: {
    //     pricesFiltered: {
    //       $filter: {
    //         input: "$prices",
    //         cond: {
    //           $eq: ["$$item.countryId", new ObjectId(countryId)],
    //         },
    //         as: "item",
    //         limit: 1,
    //       },
    //     },
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $addFields: {
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //   },
    // },
  ];

  const FILTERS_COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // isVendorActive: true,
        // isHelper: false,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        ...commonMatch,
      },
    },
    //added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    //added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: false,
      },
    },
    ...COMMON_AGG,
  ];


  const QUERY_TOTAL = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        ...commonMatch,
      },
    },
  ]

  let products,
    minPriceData,
    maxPriceData,
    totalProducts,
    // currencyData,
    brandAndSubCatData,
    filtersOne = [],
    filtersTwo = [],
    specifications = [],
    currentCurrency,
    usdCurrency;

  try {
    // [currencyData] = await Currency.aggregate([
    //   {
    //     $match: {
    //       countriesId: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $limit: 1,
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sign: 1,
    //     },
    //   },
    // ]);

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;
    console.log("skipData",(+page - 1) * perPage)
    console.log("perPage",perPage)

    let productsObj = Product.aggregate([
      {
        $facet: {
      "products":[
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      },
      ...wishlistObj.first,
      {
        $project: {
          // name: "$langData.name",
          name: 1,
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$langData.shortDescription",
          media: "$coverImage",
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          currency: { $literal: currentCurrency.sign },
          // currency: { $literal: "$" },
          slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          // ...REVIEW_AGG.second,
          vendor: 1,
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          // countryProductPricing: 1,
          // countryCustomerGroupPricing: 1,
          // countryProductGroupPricing: 1,
          // countryCategoryPricing: 1,
          // customerGroupPricing: 1,
          // productGroupPricing: 1,
          // categoryPricing: 1,
          idForCart: 1,
          typeForCart: 1,
        },
      },
    ],
    "totalCount": [
      ...QUERY_TOTAL,
     /*  ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      }, */
      /* {
        $match: {
          isDeleted: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // Other match conditions...
        }
      }, */
      {
        $count: "total"
      }
    ]
  }
}
  ]);

    /* [
      products,
    ] = await Promise.all([
      products
    ]);

    console.log("products",products); */

    /* products = Product.aggregate([
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      },
      {
        $sort: {
          [sortByKey]: sortByValue,
        },
      },
      {
        $skip: (+page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      ...wishlistObj.first,
      {
        $project: {
          // name: "$langData.name",
          name: 1,
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$langData.shortDescription",
          media: "$coverImage",
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          currency: { $literal: currentCurrency.sign },
          // currency: { $literal: "$" },
          slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          // ...REVIEW_AGG.second,
          vendor: 1,
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          // countryProductPricing: 1,
          // countryCustomerGroupPricing: 1,
          // countryProductGroupPricing: 1,
          // countryCategoryPricing: 1,
          // customerGroupPricing: 1,
          // productGroupPricing: 1,
          // categoryPricing: 1,
          idForCart: 1,
          typeForCart: 1,
        },
      },
    ]); */

    minPriceData = { price : 20 };
    maxPriceData = { price : 1000 } ;

    /* minPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: 1,
          // price: 1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]);

    maxPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: -1,
          // price: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]); */

    brandAndSubCatData = [];

    /* brandAndSubCatData = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // isVendorActive: true,
          // isHelper: false,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
          ...commonMatch,
          // categoryId: {
          //   $in: [
          //     ObjectId(categoryFilters._id),
          //     ...childCategoryIds?.ids.map((id) => ObjectId(id)),
          //   ],
          // },
        },
      },
      //added new start
      {
        $lookup: {
          from: "vendorproducts",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$id"],
                },
                isDeleted: false,
                isActive: true,
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "vendorData",
        },
      },
      {
        $unwind: {
          path: "$vendorData",
        },
      },
      //added new end
      {
        $group: {
          _id: "x50",
          // subCategoriesId: {
          //   $addToSet: "$categoryId",
          // },
          brandsId: {
            $addToSet: "$brandId",
          },
        },
      },
      // {
      //   $addFields: {
      //     subCategoriesId: {
      //       $setIntersection: [
      //         "$subCategoriesId",
      //         childCategoryIds?.secondIds.map((id) => ObjectId(id)),
      //       ],
      //     },
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "productcategorydescriptions",
      //     let: {
      //       ids: "$subCategoriesId",
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $and: [
      //             {
      //               $expr: {
      //                 $in: ["$productCategoryId", "$$ids"],
      //               },
      //               languageCode: languageCode,
      //             },
      //           ],
      //         },
      //       },
      //       {
      //         $project: {
      //           name: 1,
      //           _id: "$productCategoryId",
      //         },
      //       },
      //     ],
      //     as: "subCategoriesData",
      //   },
      // },
      {
        $lookup: {
          from: "brands",
          let: {
            ids: "$brandsId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "brandsData",
        },
      },
      {
        $project: {
          subCategoriesId: 0,
          brandsId: 0,
        },
      },
    ]); */

    /* totalProducts = Product.aggregate([
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      },
    ]); */

    /* if (categoryFilters.variantFilterIds) {
      //console.log(categoryFilters.variantFilterIds,"categoryFilters.variantFilterIds");
      filtersOne = Product.aggregate([
        ...FILTERS_COMMON,
        {
          $match: {
            "variantData.firstVariantId": {
              $in: categoryFilters.variantFilterIds.map((v) => new ObjectId(v)),
            },
          },
        },
        {
          $group: {
            _id: "$variantData.firstVariantId",
            name: {
              $first: "$variantData.firstVariantName",
            },
            values: {
              $addToSet: "$variantData.firstSubVariantName",
            },
            valuesId: {
              $addToSet: "$variantData.firstSubVariantId",
            },
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPages: "$valuesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$mainPage", "$$mainPages"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$firstVariantIdLangData",
          },
        },
        {
          $addFields: {
            langName: "$firstVariantIdLangData.name",
            langValues: {
              $map: {
                input: "$firstSubVariantIdLangData",
                as: "variant",
                in: "$$variant.name",
              },
            },
          },
        },
      ]);

      filtersTwo = Product.aggregate([
        ...FILTERS_COMMON,
        {
          $match: {
            "variantData.secondVariantId": {
              $in: categoryFilters.variantFilterIds.map((v) => new ObjectId(v)),
            },
          },
        },
        {
          $group: {
            _id: "$variantData.secondVariantId",
            name: {
              $first: "$variantData.secondVariantName",
            },
            values: {
              $addToSet: "$variantData.secondSubVariantName",
            },
            valuesId: {
              $addToSet: "$variantData.secondSubVariantId",
            },
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPages: "$valuesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$mainPage", "$$mainPages"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$secondVariantIdLangData",
          },
        },
        {
          $addFields: {
            langName: "$secondVariantIdLangData.name",
            langValues: {
              $map: {
                input: "$secondSubVariantIdLangData",
                as: "variant",
                in: "$$variant.name",
              },
            },
          },
        },
      ]);
    }

    if (categoryFilters.specificationFilterIds) {
      specifications = Product.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            isPublished: true,
            isApproved: true,
            // isVendorActive: true,
            // isHelper: false,
            // countries: {
            //   $in: [new ObjectId(countryId)],
            // },
            ...commonMatch,
          },
        },
        //added new start
        {
          $lookup: {
            from: "vendorproducts",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  isDeleted: false,
                  isActive: true,
                },
              },
              {
                $sort: {
                  createdAt: 1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "vendorData",
          },
        },
        {
          $unwind: {
            path: "$vendorData",
          },
        },
        //added new end
        {
          $lookup: {
            from: "productdescriptions",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  features: 1,
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
          $unwind: {
            path: "$langData.features",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$langData.features",
          },
        },
        // {
        //   $group: {
        //     _id: "$id",
        //     name: {
        //       $first: "$label",
        //     },
        //     values: {
        //       $addToSet: "$value",
        //     },
        //   },
        // },
        {
          $group: {
            _id: "$label",
            values: {
              $addToSet: "$value",
            },
          },
        },
        {
          $lookup: {
            from: "subspecificationgroups",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$_id"],
                  },
                  isActive: true,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "subspecificationgroupdescriptions",
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$subSpecificationId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                    {
                      $project: {
                        name: 1,
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
            ],
            as: "groupData",
          },
        },
        {
          $unwind: {
            path: "$groupData",
          },
        },
        {
          $lookup: {
            from: "subspecificationgroupvalues",
            let: {
              ids: "$values",
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
                $lookup: {
                  from: "subspecificationgroupvaluedescriptions",
                  let: {
                    id: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$subSpecificationGroupValueId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                    {
                      $project: {
                        name: 1,
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
                  _id: 0,
                  name: "$langData.name",
                },
              },
            ],
            as: "values",
          },
        },
        {
          $project: {
            name: "$groupData.name",
            values: {
              $map: {
                input: "$values",
                as: "item",
                in: "$$item.name",
              },
            },
          },
        },
      ]);
    } */

    /* [
      products,
      [minPriceData],
      [maxPriceData],
      totalProducts,
      [brandAndSubCatData],
      filtersOne,
      filtersTwo,
      specifications,
    ] = await Promise.all([
      products,
      minPriceData,
      maxPriceData,
      totalProducts,
      brandAndSubCatData,
      filtersOne,
      filtersTwo,
      specifications,
    ]); */

    [
      [productsObj]
    ] = await Promise.all([
      productsObj
    ]);

    products = productsObj.products ? productsObj.products : [];
    totalProducts =
      productsObj.totalCount &&
      productsObj.totalCount.length > 0 &&
      productsObj.totalCount[0].total
        ? productsObj.totalCount[0].total
        : 0;

    
    console.log("products", products);
    console.log("totalProducts", productsObj.totalCount);
  } catch (err) {
    //console.log("product -get -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
      brands: [],
      subCategories: [],
      filters: [],
    });
  }

  // products = products.map((p) => {
  //   if (p.countryProductPricing) {
  //     p.price = p.countryProductPricing.value;
  //   } else if (p.countryCustomerGroupPricing) {
  //     p.price = (p.buyingPrice * (100 + p.countryCustomerGroupPricing)) / 100;
  //   } else if (p.countryProductGroupPricing) {
  //     p.price = (p.buyingPrice * (100 + p.countryProductGroupPricing)) / 100;
  //   } else if (p.countryCategoryPricing) {
  //     p.price = (p.buyingPrice * (100 + p.countryCategoryPricing)) / 100;
  //   } else if (p.customerGroupPricing) {
  //     p.price = (p.buyingPrice * (100 + p.customerGroupPricing)) / 100;
  //   } else if (p.productGroupPricing) {
  //     p.price = (p.buyingPrice * (100 + p.productGroupPricing)) / 100;
  //   } else if (p.categoryPricing) {
  //     p.price = (p.buyingPrice * (100 + p.categoryPricing)) / 100;
  //   }

  //   delete p.buyingPrice;
  //   return p;
  // });

  let filters = [];
  const newFilters = [];

  if (filtersOne.length > 0 && filtersTwo.length > 0) {
    // filtersOne.forEach((filter) => {});

    for (let i = 0; i < filtersOne.length; i++) {
      const filter = filtersOne[i];
      const common = filtersTwo.find(
        (f) => f._id.toString() == filter._id.toString()
      );
      if (!common) {
        filters.push({
          _id: filter._id,
          name: filter.langName,
          values: filter.langValues,
        });
      } else {
        let unique = new Set([...filter.langValues, ...common.langValues]);
        unique = [...unique];

        filters.push({
          _id: filter._id,
          name: filter.langName,
          values: unique,
        });
      }
    }

    for (let i = 0; i < filtersTwo.length; i++) {
      const filter = filtersTwo[i];
      const isAdded = filters.find(
        (f) => f._id.toString() == filter._id.toString()
      );
      if (!isAdded) {
        filters.push({
          _id: filter._id,
          name: filter.langName,
          // values: unique,
          values: filter.langValues,
        });
      }
    }

    // filtersTwo.forEach((filter) => {});
  } else if (filtersOne.length > 0) {
    filters = filtersOne.map((f) => ({
      _id: f._id,
      name: f.langName,
      values: f.langValues,
    }));
  } else if (filtersTwo.length > 0) {
    filters = filtersTwo.map((f) => ({
      _id: f._id,
      name: f.langName,
      values: f.langValues,
    }));
  }

  const filterIds = categoryFilters.variantFilterIds;

  filterIds.forEach((f) => {
    const isExist = filters.find(
      (filter) => filter._id.toString() == f.toString()
    );
    if (isExist) {
      newFilters.push(isExist);
    }
  });

  let newSpecifications = [];

  //instead of this use this in aggregate in match
  if (specifications.length > 0) {
    categoryFilters.specificationGroupsData.forEach((sp) => {
      const isExist = specifications.find(
        (s) => s._id.toString() == sp.toString()
      );

      if (isExist) {
        newSpecifications.push(isExist);
      }
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    minPrice: minPriceData?.price ?? 0,
    maxPrice: maxPriceData?.price ?? 0,
    totalProducts: totalProducts,
    currency: "$",
    brands: brandAndSubCatData?.brandsData ?? [],
    subCategories: brandAndSubCatData?.subCategoriesData ?? [],
    filters: newFilters,
    categoryData: {
      name: categoryFilters.name,
      slug: categoryFilters.langData.slug,
      metaData: categoryFilters.langData.metaData,
    },
    specifications: newSpecifications,
  });
};

//updated
exports.getOne = async (req, res, next) => {
  const { slug } = req.params;
  const { vendor } = req.query;

  console.log("get_product_data", req.params, req.query);

  let countryId = req.countryId;
  let languageCode = req.languageCode;
  // let id = "643fbd3447e6c96d9abc232a";
  const userId = req.userId;
  const role = req.role;

  let product,
    // currencyData,
    productVariant,
    variants = [],
    selectedVariant = {},
    recentlyViewedProducts = [],
    variantsValue = [], //name and values[]
    otherSellers = [],
    currentCurrency,
    usdCurrency;

  let reviewData, reviews;

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (role === "customer") {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  let AGG_HELPER = {
    first: {},
    second: [],
    third: [
      {
        $addFields: {
          price: "$productVendorData.discountedPrice",
        },
      },
    ],
    fourth: { "descData.slug": slug },
  };

  const VENDOR_OBJ = {};

  if (vendor && ObjectId.isValid(vendor)) {
    VENDOR_OBJ.vendorId = new ObjectId(vendor);
  }

  const VARIANT_ID = {};

  try {
    // [currencyData] = await Currency.aggregate([
    //   {
    //     $match: {
    //       countriesId: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $limit: 1,
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sign: 1,
    //     },
    //   },
    // ]);

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: {},
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    // productVariant = await ProductVariant.findOne({ slug, isDeleted: false });
    [productVariant] = await ProductVariantDescription.aggregate([
      {
        $match: {
          slug,
        },
      },
      {
        $lookup: {
          from: "productvariants",
          let: {
            id: "$productVariantId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                // isDeleted: false,
                // isActive: true,
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
    ]);

    if (productVariant) {
      if (!productVariant.result.isActive || productVariant.result.isDeleted) {
        //Has variant but variant is either deleted or not active then fetch different variant of the same product
        let [differentProduct] = await Product.aggregate([
          {
            $match: {
              _id: new ObjectId(productVariant.result.mainProductId),
              isDeleted: false,
              isActive: true,
              isPublished: true,
              isApproved: true,
            },
          },
          {
            $lookup: {
              from: "vendorproducts",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productId", "$$id"],
                    },
                    isDeleted: false,
                    isActive: true,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $lookup: {
              from: "productvariants",
              let: {
                id: "$_id",
                vendorId: "$vendorData.vendorId",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$mainProductId", "$$id"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isDeleted", false],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isActive", true],
                        },
                      },
                    ],
                  },
                },
                {
                  $lookup: {
                    from: "productvariantdescriptions",
                    let: {
                      productVariantId: "$_id",
                    },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $eq: [
                                  "$productVariantId",
                                  "$$productVariantId",
                                ],
                              },
                              languageCode: languageCode,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          name: 1,
                          slug: 1,
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
                  $lookup: {
                    from: "vendorproductvariants",
                    let: {
                      productVariantId: "$_id",
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$productVariantId", "$$productVariantId"],
                          },
                          isDeleted: false,
                          isActive: true,
                          $and: [
                            {
                              $expr: {
                                $eq: ["$vendorId", "$$vendorId"],
                              },
                            },
                          ],
                        },
                      },
                      {
                        $sort: {
                          createdAt: 1,
                        },
                      },
                      {
                        $limit: 1,
                      },
                    ],
                    as: "vendorData",
                  },
                },
                {
                  $unwind: {
                    path: "$vendorData",
                  },
                },
              ],
              as: "variantData",
            },
          },
          {
            $unwind: {
              path: "$variantData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                {
                  $and: [
                    {
                      $expr: {
                        $gt: [
                          {
                            $size: "$variants",
                          },
                          0,
                        ],
                      },
                    },
                    {
                      "variantData._id": {
                        $exists: true,
                      },
                    },
                  ],
                },
                {
                  $and: [
                    {
                      $expr: {
                        $eq: [
                          {
                            $size: "$variants",
                          },
                          0,
                        ],
                      },
                    },
                    {
                      "variantData._id": {
                        $exists: false,
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    ],
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
              slug: {
                $ifNull: ["$variantData.langData.slug", "$langData.slug"],
              },
              vendor: "$vendorData.vendorId",
            },
          },
        ]);

        if (differentProduct) {
          req.params.slug = differentProduct.slug;
          req.query.vendor = differentProduct.vendor;
          this.getOne(req, res, next);
          return;
        } else {
          return res.status(404).json({
            status: false,
            message: "Product not found",
            product: {},
            currency: "$",
            variants: [],
            selectedVariant: {},
            variantsValue: [],
          });
        }
      }

      VARIANT_ID._id = new ObjectId(productVariant.result._id);

      AGG_HELPER = {
        first: {
          _id: new ObjectId(productVariant.result.mainProductId),
        },
        second: [
          {
            $lookup: {
              from: "productvariants",
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: [
                            new ObjectId(productVariant.result._id),
                            "$_id",
                          ],
                        },
                        isDeleted: false,
                        isActive: true,
                      },
                    ],
                  },
                },
                {
                  $lookup: {
                    from: "vendorproductvariants",
                    let: {
                      productVariantId: "$_id",
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$productVariantId", "$$productVariantId"],
                          },
                          isDeleted: false,
                          isActive: true,
                          // vendorId: new ObjectId(vendor),
                          ...VENDOR_OBJ,
                        },
                      },
                      {
                        $sort: {
                          createdAt: 1,
                        },
                      },
                      {
                        $limit: 1,
                      },
                    ],
                    as: "productVendorData",
                  },
                },
                {
                  $unwind: {
                    path: "$productVendorData",
                  },
                },
              ],
              as: "variantData",
            },
          },
          {
            $unwind: {
              path: "$variantData",
            },
          },
        ],
        third: [
          {
            $addFields: {
              price: "$variantData.productVendorData.sellingPrice",
              media: "$variantData.media",
            },
          },
        ],
        fourth: {},
      };

      // if (selectedVariant) {
      //   selectedVariant.firstVariant =
      //     selectedVariant.langData.firstVariantIdName;

      //   selectedVariant.firstValue =
      //     selectedVariant.langData.firstSubVariantIdName;

      //   selectedVariant.secondVariant =
      //     selectedVariant.langData.secondVariantIdName;

      //   selectedVariant.secondValue =
      //     selectedVariant.langData.secondSubVariantIdName;

      //   delete selectedVariant.langData;
      // }

      // const values = variants.reduce((acc, cv) => {
      //   if (acc[cv.firstVariant]) {
      //     acc[cv.firstVariant] = [...acc[cv.firstVariant], cv.firstValue];
      //   } else {
      //     acc[cv.firstVariant] = [cv.firstValue];
      //   }

      //   if (cv.secondVariant) {
      //     if (acc[cv.secondVariant]) {
      //       acc[cv.secondVariant] = [...acc[cv.secondVariant], cv.secondValue];
      //     } else {
      //       acc[cv.secondVariant] = [cv.secondValue];
      //     }
      //   }

      //   return acc;
      // }, {});
    } else {
      // const desc = await ProductDescription.findOne({
      //   slug,
      // });
      // Product.findByIdAndUpdate(desc.productId, {
      //   $inc: {
      //     views: 1,
      //   },
      // })
      //   .then()
      //   .catch();
    }

    product = Product.aggregate([
      {
        $match: {
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
          isDeleted: false,
          // isVendorActive: true,
          // isHelper: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // slug,
          ...AGG_HELPER.first,
        },
      },
      ...AGG_HELPER.second,
      {
        $lookup: {
          from: "productdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$id"],
                },
                // languageCode: languageCode,
              },
            },
          ],
          as: "descData",
        },
      },
      // {
      //   $unwind: {
      //     path: "$descData",
      //   },
      // },
      {
        $match: {
          ...AGG_HELPER.fourth,
        },
      },
      {
        $lookup: {
          from: "vendorproducts",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$id"],
                },
                // vendorId: new ObjectId(vendor),
                ...VENDOR_OBJ,
                isDeleted: false,
                isActive: true,
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "productVendorData",
        },
      },
      {
        $unwind: {
          path: "$productVendorData",
        },
      },
      {
        $addFields: {
          vendor: {
            $ifNull: [
              "$variantData.productVendorData.vendorId",
              "$productVendorData.vendorId",
            ],
          },
          sellingPrice: {
            $ifNull: [
              "$variantData.productVendorData.sellingPrice",
              "$productVendorData.sellingPrice",
            ],
          },
          discountedPrice: {
            $ifNull: [
              "$variantData.productVendorData.discountedPrice",
              "$productVendorData.discountedPrice",
            ],
          },
          buyingPriceCurrency: {
            $ifNull: [
              "$variantData.productVendorData.buyingPriceCurrency",
              "$productVendorData.buyingPriceCurrency",
            ],
          },
          idForCart: {
            $ifNull: [
              "$variantData.productVendorData._id",
              "$productVendorData._id",
            ],
          },
          typeForCart: {
            $cond: ["$variantData.productVendorData._id", "variant", "main"],
          },
        },
      },
      {
        $lookup: {
          from: "vendors",
          let: {
            id: "$vendor",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
            {
              $addFields: {
                reviewsCount: 0,
                ratings: 0,
              },
            },
            {
              $project: {
                businessName: 1,
                profilePic: 1,
                ratings: 1,
                reviewsCount: 1,
              },
            },
          ],
          as: "vendorData",
        },
      },
      {
        $unwind: {
          path: "$vendorData",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...AGG_HELPER.third,
      {
        $addFields: {
          ratings: 0,
          reviewsCount: 0,
          discountPercentage: 0,
          descData: {
            $filter: {
              input: "$descData",
              cond: {
                $eq: ["$$item.languageCode", languageCode],
              },
              as: "item",
              limit: 1,
            },
          },
        },
      },
      {
        $unwind: {
          path: "$descData",
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            ids: "$alternateProducts",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                  },
                  // {
                  //   $expr: {
                  //     $in: [new ObjectId(countryId), "$countries"],
                  //   },
                  // },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isActive", true],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isPublished", true],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isApproved", true],
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                ratings: 0,
                reviewsCount: 0,
                media: "$coverImage",
                // discountPercentage: 0,
                // pricesFiltered: {
                //   $filter: {
                //     input: "$prices",
                //     cond: {
                //       $eq: ["$$item.countryId", new ObjectId(countryId)],
                //     },
                //     as: "item",
                //     limit: 1,
                //   },
                // },
                // media: {
                //   $filter: {
                //     input: "$media",
                //     cond: {
                //       $eq: ["$$item.isFeatured", true],
                //     },
                //     as: "item",
                //     limit: 1,
                //   },
                // },
              },
            },
            {
              $lookup: {
                from: "productdescriptions",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$productId", "$$id"],
                      },
                      languageCode: languageCode,
                    },
                  },
                ],
                as: "descData",
              },
            },
            {
              $unwind: {
                path: "$descData",
              },
            },
            {
              $lookup: {
                from: "vendorproducts",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$productId", "$$id"],
                      },
                      isDeleted: false,
                      isActive: true,
                    },
                  },
                  {
                    $sort: {
                      createdAt: 1,
                    },
                  },
                  {
                    $limit: 1,
                  },
                ],
                as: "productVendorData",
              },
            },
            {
              $unwind: {
                path: "$productVendorData",
              },
            },
            {
              $lookup: {
                from: "productvariants",
                let: {
                  id: "$_id",
                  vendorId: "$productVendorData.vendorId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$$id", "$mainProductId"],
                          },
                          isDeleted: false,
                          isActive: true,
                        },
                      ],
                    },
                  },
                  {
                    $sort: {
                      createdAt: 1,
                    },
                  },
                  {
                    $limit: 1,
                  },
                  {
                    $lookup: {
                      from: "productvariantdescriptions",
                      let: {
                        id: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$productVariantId", "$$id"],
                            },
                            languageCode: languageCode,
                          },
                        },
                      ],
                      as: "descData",
                    },
                  },
                  {
                    $unwind: {
                      path: "$descData",
                    },
                  },
                  {
                    $lookup: {
                      from: "vendorproductvariants",
                      let: {
                        productVariantId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$productVariantId", "$$productVariantId"],
                            },
                            isDeleted: false,
                            isActive: true,
                            $and: [
                              {
                                $expr: {
                                  $eq: ["$vendorId", "$$vendorId"],
                                },
                              },
                            ],
                          },
                        },
                        {
                          $sort: {
                            createdAt: 1,
                          },
                        },
                        {
                          $limit: 1,
                        },
                      ],
                      as: "productVendorData",
                    },
                  },
                  {
                    $unwind: {
                      path: "$productVendorData",
                    },
                  },
                ],
                as: "variantData",
              },
            },
            {
              $unwind: {
                path: "$variantData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                slug: {
                  $ifNull: ["$variantData.descData.slug", "$descData.slug"],
                },
                vendor: {
                  $ifNull: [
                    "$variantData.productVendorData.vendorId",
                    "$productVendorData.vendorId",
                  ],
                },
                name: {
                  $cond: [
                    "$variantData",
                    {
                      $cond: [
                        "$variantData.secondVariantName",
                        {
                          $concat: [
                            "$descData.name",
                            " (",
                            "$variantData.firstSubVariantName",
                            ",",
                            "$variantData.secondSubVariantName",
                            ")",
                          ],
                        },
                        {
                          $concat: [
                            "$descData.name",
                            " (",
                            "$variantData.firstSubVariantName",
                            ")",
                          ],
                        },
                      ],
                    },
                    "$descData.name",
                  ],
                },
                sellingPrice: {
                  $ifNull: [
                    "$variantData.productVendorData.sellingPrice",
                    "$productVendorData.sellingPrice",
                  ],
                },
                discountedPrice: {
                  $ifNull: [
                    "$variantData.productVendorData.discountedPrice",
                    "$productVendorData.discountedPrice",
                  ],
                },
                buyingPriceCurrency: {
                  $ifNull: [
                    "$variantData.productVendorData.buyingPriceCurrency",
                    "$productVendorData.buyingPriceCurrency",
                  ],
                },
                idForCart: {
                  $ifNull: [
                    "$variantData.productVendorData._id",
                    "$productVendorData._id",
                  ],
                },
                typeForCart: {
                  $cond: [
                    "$variantData.productVendorData._id",
                    "variant",
                    "main",
                  ],
                },
              },
            },
            {
              $addFields: {
                ratings: 0,
                reviewsCount: 0,
                discountPercentage: 0,
                media: "$coverImage",
              },
            },
            {
              $limit: 5,
            },
            ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
            {
              $project: {
                name: 1,
                ratings: 1,
                reviewsCount: 1,
                shortDescription: "$descData.shortDescription",
                media: 1,
                price: 1,
                discountedPrice: 1,
                discountPercentage: 1,
                slug: 1,
                currency: { $literal: currentCurrency.sign },
                vendor: 1,
              },
            },
          ],
          as: "similarProducts",
        },
      },
      ...wishlistObj.first,
      ...REVIEW_AGG.first,

      {
        $lookup: {
          from: "productvariantdescriptions",
          let: {
            id: "$variantData._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productVariantId", "$$id"],
                },
                languageCode: languageCode,
              },
            },
          ],
          as: "vDesc",
        },
      },
      {
        $unwind: {
          path: "$vDesc",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $project: {
          media: 1,
          name: {
            $cond: [
              "$variantData",
              {
                $cond: [
                  "$variantData.secondVariantName",
                  {
                    $concat: [
                      "$descData.name",
                      " (",
                      "$variantData.firstSubVariantName",
                      ",",
                      "$variantData.secondSubVariantName",
                      ")",
                    ],
                  },
                  {
                    $concat: [
                      "$descData.name",
                      " (",
                      "$variantData.firstSubVariantName",
                      ")",
                    ],
                  },
                ],
              },
              "$descData.name",
            ],
          },
          vendorData: 1,
          slug: {
            $cond: ["$variantData", "$vDesc.slug", "$descData.slug"],
          },
          price: 1,
          discountedPrice: 1,
          ratings: 1,
          discountPercentage: 1,
          reviewsCount: 1,
          description: "$descData.longDescription",
          features: "$descData.features",
          faqs: "$descData.faqs",
          metaData: "$descData.metaData",
          similarProducts: 1,
          currency: { $literal: currentCurrency.sign },
          featureTitle: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          ...REVIEW_AGG.second,
          categoryId: 1,
          brandId: 1,
          unitId: 1,
          coverImage: 1,
          shareUrl: {
            $concat: [
              process.env.FRONTEND_URL,
              "/product/",
              {
                $cond: ["$variantData", "$vDesc.slug", "$descData.slug"],
              },
            ],
          },
          idForCart: 1,
          typeForCart: 1,
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupdescriptions",
          let: {
            labels: "$features.label",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$subSpecificationId", "$$labels"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                index: {
                  $indexOfArray: ["$$labels", "$subSpecificationId"],
                },
              },
            },
          ],
          as: "labels",
        },
      },
      {
        $lookup: {
          from: "subspecificationgroupvaluedescriptions",
          let: {
            values: "$features.value",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$subSpecificationGroupValueId", "$$values"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                _id: 0,
                value: "$name",
                index: {
                  $indexOfArray: ["$$values", "$subSpecificationGroupValueId"],
                },
              },
            },
          ],
          as: "values",
        },
      },
      {
        $addFields: {
          features: {
            $map: {
              input: {
                $range: [
                  0,
                  {
                    $size: "$labels",
                  },
                ],
              },
              as: "this",
              in: {
                $mergeObjects: [
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$labels",
                          as: "label",
                          cond: {
                            $eq: ["$$label.index", "$$this"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$values",
                          as: "value",
                          cond: {
                            $eq: ["$$value.index", "$$this"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    if (role === "customer") {
      recentlyViewedProducts = Customer.aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
          },
        },
        {
          $project: {
            recentlyViewedProducts: 1,
          },
        },
        {
          $unwind: {
            path: "$recentlyViewedProducts",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$recentlyViewedProducts",
          },
        },
        {
          $lookup: {
            from: "vendorproducts",
            let: {
              id: "$id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                  isDeleted: false,
                  isActive: true,
                },
              },
              {
                $lookup: {
                  from: "productdescriptions",
                  let: {
                    id: "$productId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$productId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                  ],
                  as: "descData",
                },
              },
              {
                $lookup: {
                  from: "products",
                  let: {
                    id: "$productId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$id"],
                        },
                        isDeleted: false,
                        isActive: true,
                        isPublished: true,
                        isApproved: true,
                      },
                    },
                    {
                      $project: {
                        coverImage: 1,
                        categoryId: 1,
                      },
                    },
                  ],
                  as: "productData",
                },
              },
              {
                $unwind: {
                  path: "$descData",
                },
              },
              {
                $unwind: {
                  path: "$productData",
                },
              },
            ],
            as: "vendorProducts",
          },
        },
        {
          $unwind: {
            path: "$vendorProducts",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "vendorproductvariants",
            let: {
              id: "$id",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$id"],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isDeleted", false],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isActive", true],
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "productvariantdescriptions",
                  let: {
                    id: "$productVariantId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$productVariantId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                  ],
                  as: "descData",
                },
              },
              {
                $lookup: {
                  from: "products",
                  let: {
                    id: "$mainProductId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", "$$id"],
                        },
                        isDeleted: false,
                        isActive: true,
                        isPublished: true,
                        isApproved: true,
                      },
                    },
                    {
                      $project: {
                        coverImage: 1,
                        categoryId: 1,
                      },
                    },
                  ],
                  as: "productData",
                },
              },
              {
                $unwind: {
                  path: "$descData",
                },
              },
              {
                $unwind: {
                  path: "$productData",
                },
              },
            ],
            as: "vendorProductVariants",
          },
        },
        {
          $unwind: {
            path: "$vendorProductVariants",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            price: {
              $ifNull: [
                "$vendorProducts.sellingPrice",
                "$vendorProductVariants.sellingPrice",
              ],
            },
            slug: {
              $ifNull: [
                "$vendorProducts.descData.slug",
                "$vendorProductVariants.descData.slug",
              ],
            },
            discountedPrice: {
              $ifNull: [
                "$vendorProducts.sellingPrice",
                "$vendorProductVariants.sellingPrice",
              ],
            },
            vendor: {
              $ifNull: [
                "$vendorProducts.vendorId",
                "$vendorProductVariants.vendorId",
              ],
            },
            views: {
              $ifNull: [
                "$vendorProducts.views",
                "$vendorProductVariants.views",
              ],
            },
            sellingPrice: {
              $ifNull: [
                "$vendorProducts.sellingPrice",
                "$vendorProductVariants.sellingPrice",
              ],
            },
            discountedPrice: {
              $ifNull: [
                "$vendorProducts.discountedPrice",
                "$vendorProductVariants.discountedPrice",
              ],
            },
            buyingPriceCurrency: {
              $ifNull: [
                "$vendorProducts.buyingPriceCurrency",
                "$vendorProductVariants.buyingPriceCurrency",
              ],
            },
            idForCart: "$id",
            typeForCart: "$type",
            media: {
              $ifNull: [
                "$vendorProducts.productData.coverImage",
                "$vendorProductVariants.productData.coverImage",
              ],
            },
            name: {
              $ifNull: [
                "$vendorProducts.descData.name",
                "$vendorProductVariants.descData.name",
              ],
            },
            shortDescription: {
              $ifNull: [
                "$vendorProducts.descData.shortDescription",
                "$vendorProductVariants.descData.shortDescription",
              ],
            },
            _id: {
              $ifNull: [
                "$vendorProducts.productId",
                "$vendorProductVariants.mainProductId",
              ],
            },
            categoryId: {
              $ifNull: [
                "$vendorProducts.productData.categoryId",
                "$vendorProductVariants.productData.categoryId",
              ],
            },
          },
        },
        {
          $addFields: {
            ratings: 0,
            discountPercentage: 0,
            reviewsCount: 0,
          },
        },
        ...wishlistObj.first,
        ...REVIEW_AGG.first,

        ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
        {
          $project: {
            name: 1,
            ratings: 1,
            reviewsCount: 1,
            shortDescription: 1,
            media: 1,
            price: 1,
            discountedPrice: 1,
            discountPercentage: 1,
            slug: 1,
            vendor: 1,
            idForCart: 1,
            typeForCart: 1,
            currency: { $literal: currentCurrency.sign },
            isWishlisted: {
              $toBool: false,
            },
            ...wishlistObj.second,
            ...REVIEW_AGG.second,
          },
        },
      ]);
    }

    if (false && role === "customer") {
      recentlyViewedProducts = Customer.aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "recentlyViewedProducts.id",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: {
            path: "$productData",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$productData",
          },
        },
        {
          $match: {
            isDeleted: false,
            isActive: true,
            isPublished: true,
            isApproved: true,
          },
        },
        {
          $lookup: {
            from: "productvariants",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainProductId", "$$id"],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isDeleted", false],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isActive", true],
                      },
                    },
                  ],
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "variantData",
          },
        },
        {
          $unwind: {
            path: "$variantData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            prices: {
              $ifNull: ["$variantData.prices", "$prices"],
            },
            slug: {
              $ifNull: ["$variantData.slug", "$slug"],
            },
          },
        },
        {
          $addFields: {
            ratings: 0,
            reviewsCount: 0,
            discountPercentage: 0,
            pricesFiltered: {
              $filter: {
                input: "$prices",
                cond: {
                  $eq: ["$$item.countryId", new ObjectId(countryId)],
                },
                as: "item",
                limit: 1,
              },
            },
            media: {
              $filter: {
                input: "$media",
                cond: {
                  $eq: ["$$item.isFeatured", true],
                },
                as: "item",
                limit: 1,
              },
            },
          },
        },
        {
          $unwind: {
            path: "$pricesFiltered",
          },
        },
        {
          $unwind: {
            path: "$media",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            price: "$pricesFiltered.sellingPrice",
            discountedPrice: "$pricesFiltered.discountedPrice",
            discountPercentage: {
              $round: [
                {
                  $subtract: [
                    100,
                    {
                      $divide: [
                        {
                          $multiply: ["$pricesFiltered.discountedPrice", 100],
                        },
                        "$pricesFiltered.sellingPrice",
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },
        ...wishlistObj.first,
        {
          $project: {
            name: 1,
            ratings: 1,
            reviewsCount: 1,
            shortDescription: 1,
            media: "$media.src",
            price: 1,
            discountedPrice: 1,
            discountPercentage: 1,
            // currency: { $literal: "$" },
            currency: { $literal: currentCurrency.sign },
            slug: 1,
            isWishlisted: {
              $toBool: false,
            },
            ...wishlistObj.second,
          },
        },
      ]);
    }

    [[product], recentlyViewedProducts] = await Promise.all([
      product,
      recentlyViewedProducts,
    ]);

    if (product) {
      otherSellers = VendorProduct.aggregate([
        {
          $match: {
            productId: new ObjectId(product._id),
            vendorId: {
              $ne: new ObjectId(product.vendorData._id),
            },
            isDeleted: false,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "productvariants",
            let: {
              vendorId: "$vendorId",
              productId: "$productId",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$$productId", "$mainProductId"],
                      },
                      ...VARIANT_ID,
                      isDeleted: false,
                      isActive: true,
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: "vendorproductvariants",
                  let: {
                    productVariantId: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$productVariantId", "$$productVariantId"],
                        },
                        isDeleted: false,
                        isActive: true,
                        $and: [
                          {
                            $expr: {
                              $eq: ["$vendorId", "$$vendorId"],
                            },
                          },
                        ],
                      },
                    },
                  ],
                  as: "productVendorData",
                },
              },
              {
                $unwind: {
                  path: "$productVendorData",
                },
              },
            ],
            as: "variantData",
          },
        },
        {
          $unwind: {
            path: "$variantData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            let: {
              productId: "$productId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$productId"],
                  },
                },
              },
              {
                $project: {
                  variants: 1,
                  categoryId: 1,
                },
              },
            ],
            as: "productData",
          },
        },
        {
          $unwind: {
            path: "$productData",
          },
        },
        {
          $match: {
            $or: [
              {
                $and: [
                  {
                    $expr: {
                      $gt: [
                        {
                          $size: "$productData.variants",
                        },
                        0,
                      ],
                    },
                  },
                  {
                    "variantData._id": {
                      $exists: true,
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    $expr: {
                      $eq: [
                        {
                          $size: "$productData.variants",
                        },
                        0,
                      ],
                    },
                  },
                  {
                    "variantData._id": {
                      $exists: false,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $addFields: {
            slug,
            ratings: 0,
            reviewsCount: 0,
            sellingPrice: {
              $ifNull: [
                "$variantData.productVendorData.sellingPrice",
                "$sellingPrice",
              ],
            },
            discountedPrice: {
              $ifNull: [
                "$variantData.productVendorData.discountedPrice",
                "$discountedPrice",
              ],
            },
            buyingPriceCurrency: {
              $ifNull: [
                "$variantData.productVendorData.buyingPriceCurrency",
                "$buyingPriceCurrency",
              ],
            },
            idForCart: {
              $ifNull: [
                "$variantData.productVendorData._id",
                "$productVendorData._id",
              ],
            },
            typeForCart: {
              $cond: ["$variantData.productVendorData._id", "variant", "main"],
            },
            _id: "$productId",
            categoryId: "$productData.categoryId",
          },
        },
        {
          $lookup: {
            from: "vendors",
            let: {
              id: "$vendorId",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$id"],
                      },
                    },
                  ],
                  isActive: true,
                  isDeleted: false,
                },
              },
              {
                $addFields: {
                  ratings: 0,
                  reviewsCount: 0,
                },
              },
              {
                $project: {
                  businessName: 1,
                  profilePic: 1,
                  ratings: 1,
                  reviewsCount: 1,
                },
              },
            ],
            as: "vendorData",
          },
        },
        {
          $unwind: {
            path: "$vendorData",
          },
        },
        ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
        {
          $project: {
            name: product.name,
            media: product.coverImage,
            price: 1,
            discountedPrice: 1,
            discountPercentage: 1,
            vendorData: 1,
            slug: 1,
            currency: { $literal: currentCurrency.sign },
          },
        },
      ]);

      let allReviews = Review.find({
        itemId: new ObjectId(product.idForCart),
        status: "approved",
      }).lean();

      reviews = Review.aggregate([
        {
          $match: {
            itemId: new ObjectId(product.idForCart),
            status: "approved",
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "customers",
            let: {
              id: "$userId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$_id"],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  name: {
                    $concat: ["$firstName", " ", "$lastName"],
                  },
                  profilePic: 1,
                },
              },
            ],
            as: "userData",
          },
        },
        {
          $lookup: {
            from: "orderitems",
            let: {
              id: "$orderItemId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$_id"],
                  },
                },
              },
              {
                $lookup: {
                  from: "orders",
                  let: {
                    orderId: "$orderId",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$$orderId", "$_id"],
                        },
                      },
                    },
                  ],
                  as: "orderData",
                },
              },
              {
                $addFields: {
                  orderData: {
                    $arrayElemAt: ["$orderData", 0],
                  },
                },
              },
              {
                $lookup: {
                  from: "countries",
                  let: {
                    id: "$orderData.address.countryCode",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$$id", "$_id"],
                        },
                      },
                    },
                    {
                      $project: {
                        name: 1,
                        flag: 1,
                      },
                    },
                  ],
                  as: "countryData",
                },
              },
              {
                $addFields: {
                  countryData: {
                    $arrayElemAt: ["$countryData", 0],
                  },
                },
              },
            ],
            as: "orderItemData",
          },
        },
        {
          $addFields: {
            userData: {
              $arrayElemAt: ["$userData", 0],
            },
            orderItemData: {
              $arrayElemAt: ["$orderItemData", 0],
            },
          },
        },
        {
          $project: {
            rating: 1,
            review: 1,
            files: 1,
            createdAt: 1,
            isRecommended: 1,
            userData: 1,
            countryName: "$orderItemData.countryData.name",
            countryFlag: "$orderItemData.countryData.flag",
          },
        },
      ]);

      [otherSellers, allReviews, reviews] = await Promise.all([
        otherSellers,
        allReviews,
        reviews,
      ]);

      const reviewDataReduced = allReviews.reduce(
        (acc, cv) => {
          acc[cv.rating] = acc[cv.rating] + 1;

          if (cv.isRecommended) {
            acc.recommended++;
          }

          return acc;
        },
        {
          recommended: 0,
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        }
      );

      reviewData = {
        recommended: +(
          (reviewDataReduced.recommended / allReviews.length) *
          100
        ).toFixed(),
      };

      [1, 2, 3, 4, 5].forEach((num) => {
        reviewData[num] = +(
          (reviewDataReduced[num] / allReviews.length) *
          100
        ).toFixed();
      });

      product.reviewData = reviewData;
      product.reviews = reviews;
    }

    if (product && productVariant) {
      variants = ProductVariant.aggregate([
        {
          $match: {
            mainProductId: new ObjectId(productVariant.result.mainProductId),
            isDeleted: false,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "productvariantdescriptions",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productVariantId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  slug: 1,
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
        // added new start (only active variant values)
        {
          $lookup: {
            from: "vendorproductvariants",
            let: {
              productVariantId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productVariantId", "$$productVariantId"],
                  },
                  isDeleted: false,
                  isActive: true,
                  $and: [
                    {
                      $expr: {
                        $eq: ["$vendorId", new ObjectId(product.vendorData._id)],
                      },
                    },
                  ],
                },
              },
            ],
            as: "vendorData",
          },
        },
        {
          $unwind: {
            path: "$vendorData",
          },
        },
        //added new end
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$firstVariantId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$firstSubVariantId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstSubVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$secondVariantId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$secondSubVariantId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$firstVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$firstSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$secondVariantIdLangData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$secondSubVariantIdLangData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            slug: "$result.slug",
            firstVariant: "$firstVariantName",
            firstValue: "$firstSubVariantName",
            secondVariant: "$secondVariantName",
            secondValue: "$secondSubVariantName",
            langData: {
              firstVariantId: "$firstVariantId",
              firstSubVariantId: "$firstSubVariantId",
              secondVariantId: "$secondVariantId",
              secondSubVariantId: "$secondSubVariantId",

              firstVariantIdName: "$firstVariantIdLangData.name",
              secondVariantIdName: "$secondVariantIdLangData.name",
              firstSubVariantIdName: "$firstSubVariantIdLangData.name",
              secondSubVariantIdName: "$secondSubVariantIdLangData.name",
            },
          },
        },
      ]);

      let variantWithOrder = Product.findById(
        productVariant.result.mainProductId
      )
        .lean()
        .select("variants");

      [variants, variantWithOrder] = await Promise.all([
        variants,
        variantWithOrder,
      ]);

      variantWithOrder = variantWithOrder.variants;

      ProductVariant.findByIdAndUpdate(productVariant.result._id, {
        $inc: {
          views: 1,
        },
      })
        .then()
        .catch();

      Product.findByIdAndUpdate(productVariant.result.mainProductId, {
        $inc: {
          views: 1,
        },
      })
        .then()
        .catch();

      selectedVariant = variants.find((pv) => pv.slug === slug);

      if (!selectedVariant) {
        //language changed
        selectedVariant = variants.find(
          (pv) =>
            pv.firstVariant === productVariant.result.firstVariantName &&
            pv.firstValue === productVariant.result.firstSubVariantName &&
            pv.secondVariant === productVariant.result.secondVariantName &&
            pv.secondValue === productVariant.result.secondSubVariantName
        );
      }

      const values = variants.reduce((acc, cv) => {
        if (acc[cv.langData.firstVariantId]) {
          acc[cv.langData.firstVariantId] = [
            ...acc[cv.langData.firstVariantId],
            cv.langData.firstSubVariantIdName,
          ];
        } else {
          acc[cv.langData.firstVariantId] = [cv.langData.firstSubVariantIdName];
        }

        if (cv.langData.secondVariantId) {
          if (acc[cv.langData.secondVariantId]) {
            acc[cv.langData.secondVariantId] = [
              ...acc[cv.langData.secondVariantId],
              cv.langData.secondSubVariantIdName,
            ];
          } else {
            acc[cv.langData.secondVariantId] = [
              cv.langData.secondSubVariantIdName,
            ];
          }
        }

        return acc;
      }, {});

      const valuesTwo = {};

      const firstVariant = variants[0];

      valuesTwo[firstVariant.langData.firstVariantId] =
        firstVariant.langData.firstVariantIdName;

      if (firstVariant.langData.secondVariantId) {
        valuesTwo[firstVariant.langData.secondVariantId] =
          firstVariant.langData.secondVariantIdName;
      }

      const order = {};

      variantWithOrder.forEach((v) => {
        order[v.id] = v.order;
      });

      for (let key in values) {
        let unique = new Set(values[key]);
        unique = [...unique];

        variantsValue.push({
          name: valuesTwo[key],
          values: unique,
          // order: variantWithOrder.find((v) => v.id.toString() == key).order,
          order: order[key],
          id: key,
        });
      }

      variantsValue = variantsValue.sort((a, b) => a.order - b.order);

      variants = variants.map((v) => {
        if (variantWithOrder.length === 2) {
          const isFirst = order[v.langData.firstVariantId] == 1;

          //two variants

          if (isFirst) {
            v.firstVariant = v.langData.firstVariantIdName;

            v.firstValue = v.langData.firstSubVariantIdName;

            v.secondVariant = v.langData.secondVariantIdName;

            v.secondValue = v.langData.secondSubVariantIdName;
          } else {
            v.firstVariant = v.langData.secondVariantIdName;

            v.firstValue = v.langData.secondSubVariantIdName;

            v.secondVariant = v.langData.firstVariantIdName;

            v.secondValue = v.langData.firstSubVariantIdName;
          }
        } else {
          v.firstVariant = v.langData.firstVariantIdName;
          v.firstValue = v.langData.firstSubVariantIdName;
        }

        delete v.langData;

        return v;
      });
    }

    if (false && product) {
      otherSellers = await Product.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            // isPublished: true,
            // isApproved: true,
            countries: {
              $in: [new ObjectId(countryId)],
            },
            isVendorActive: true,
            isHelper: false,
            _id: {
              $ne: new ObjectId(product._id),
            },
            name: new RegExp(product.name, "i"),
            masterCategoryId: new ObjectId(product.masterCategoryId),
            subCategoryId: new ObjectId(product.subCategoryId),
            brandId: new ObjectId(product.brandId),
            unitId: new ObjectId(product.unitId),
            vendor: {
              $ne: new ObjectId(product.vendorData._id),
            },
          },
        },
        {
          $lookup: {
            from: "productvariants",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainProductId", "$$id"],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isDeleted", false],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$isActive", true],
                      },
                    },
                  ],
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "variantData",
          },
        },
        {
          $unwind: {
            path: "$variantData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            prices: {
              $ifNull: ["$variantData.prices", "$prices"],
            },
            slug: {
              $ifNull: ["$variantData.slug", "$slug"],
            },
          },
        },
        {
          $addFields: {
            ratings: 0,
            reviewsCount: 0,
            discountPercentage: 0,

            pricesFiltered: {
              $filter: {
                input: "$prices",
                cond: {
                  $eq: [
                    "$$item.countryId",
                    new ObjectId("63a58161202586c94cefbc96"),
                  ],
                },
                as: "item",
                limit: 1,
              },
            },
            media: {
              $filter: {
                input: "$media",
                cond: {
                  $eq: ["$$item.isFeatured", true],
                },
                as: "item",
                limit: 1,
              },
            },
          },
        },
        {
          $unwind: {
            path: "$pricesFiltered",
          },
        },
        {
          $unwind: {
            path: "$media",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            price: "$pricesFiltered.sellingPrice",
            discountedPrice: "$pricesFiltered.discountedPrice",
            discountPercentage: {
              $round: [
                {
                  $subtract: [
                    100,
                    {
                      $divide: [
                        {
                          $multiply: ["$pricesFiltered.discountedPrice", 100],
                        },
                        "$pricesFiltered.sellingPrice",
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "vendors",
            let: {
              id: "$vendor",
            },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$id"],
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  ratings: 0,
                  discountPercentage: 0,
                  reviewsCount: 0,
                },
              },
              {
                $project: {
                  businessName: 1,
                  profilePic: 1,
                  ratings: 1,
                  reviewsCount: 1,
                },
              },
            ],
            as: "vendorData",
          },
        },
        {
          $unwind: {
            path: "$vendorData",
          },
        },
        {
          $project: {
            name: 1,
            media: "$media.src",
            price: 1,
            discountedPrice: 1,
            discountPercentage: 1,
            vendorData: 1,
            slug: 1,
            currency: { $literal: $ },
          },
        },
        {
          $limit: 4,
        },
      ]);
    }
  } catch (err) {
    console.log("product -get one -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch product",
      product: {},
      currency: "$",
      variants: [],
      selectedVariant: {},
      variantsValue: [],
    });
  }

  if (product) {
    if (role === "customer") {
      Customer.findByIdAndUpdate(userId, {
        $pull: {
          recentlyViewedProducts: {
            id: new ObjectId(product.idForCart),
          },
        },
      }).then((response) => {
        Customer.findByIdAndUpdate(userId, {
          $push: {
            recentlyViewedProducts: {
              $each: [
                {
                  id: product.idForCart,
                  type: product.typeForCart,
                  date: new Date(),
                },
              ],
              $sort: { date: -1 },
              $slice: -6,
            },
          },
        }).then();
      });
    }
  }

  res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    product,
    currency: "$",
    variants,
    selectedVariant,
    variantsValue,
    recentlyViewedProducts,
    otherSellers,
  });
};

exports.getInitialAddProductData = async (req, res, next) => {
  const id = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let data,
    customId,
    units,
    setting,
    searchBrands,
    searchCategories,
    searchVendors,
    categories,
    currencies,
    brands,
    variantCustomId,
    shippingCompanies;

  try {
    // data = Vendor.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         ids: "$productCategories",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "masterCategories",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "warehouses",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$vendor", "$$id"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "warehouses",
    //     },
    //   },
    //   {
    //     $project: {
    //       masterCategories: 1,
    //       warehouses: 1,
    //     },
    //   },
    // ]);

    // searchBrands = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       localField: "brandId",
    //       foreignField: "_id",
    //       as: "brandData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$brandData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$brandData._id",
    //       name: {
    //         $first: "$brandData.name",
    //       },
    //     },
    //   },
    // ]);

    // searchCategories = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       localField: "masterCategoryId",
    //       foreignField: "_id",
    //       as: "categoryData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$categoryData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$categoryData._id",
    //       name: {
    //         $first: "$categoryData.name",
    //       },
    //     },
    //   },
    // ]);

    // searchVendors = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "vendors",
    //       localField: "vendor",
    //       foreignField: "_id",
    //       as: "vendorData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$vendorData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$vendorData._id",
    //       name: {
    //         $first: "$vendorData.businessName",
    //       },
    //     },
    //   },
    // ]);

    currencies = Currency.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          _id: 1,
          sign: 1,
        },
      },
    ]);

    brands = Brand.find({ isDeleted: false }).select("_id name").lean();

    customId = idCreator("product", false);

    variantCustomId = idCreator("productVariant", false);

    units = Unit.find({ isDeleted: false }).select("_id name").lean();

    setting = Setting.findOne({ key: "Product.files" });

    shippingCompanies = ShippingCompany.find({ isDeleted: false }).select(
      "_id name"
    );

    [
      // [data],
      customId,
      variantCustomId,
      units,
      setting,
      // searchBrands,
      // searchCategories,
      // searchVendors,
      categories,
      currencies,
      brands,
      shippingCompanies,
    ] = await Promise.all([
      // data,
      customId,
      variantCustomId,
      units,
      setting,
      // searchBrands,
      // searchCategories,
      // searchVendors,
      getAllCategories(),
      currencies,
      brands,
      shippingCompanies,
    ]);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  variantCustomId = variantCustomId.split("NMPV")[1];

  res.status(200).json({
    status: true,
    message: "Data fetched successfully",
    // data,
    customId,
    units,
    maximumImagesCount: +setting.value,
    searchBrands: brands,
    searchCategories: categories,
    // searchVendors,
    categories: categories,
    currencies,
    brands,
    variantCustomId: +variantCustomId,
    shippingCompanies,
  });
};

exports.getSubCategoryAndCountry = async (req, res, next) => {
  const vendorId = req.userId;
  const { masterCategory } = req.params;
  let data;
  try {
    [data] = await Vendor.aggregate([
      {
        $match: {
          _id: new ObjectId(vendorId),
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            countries: "$serveCountries",
          },
          pipeline: [
            {
              $unwind: {
                path: "$country",
              },
            },
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", new ObjectId(masterCategory)],
                    },
                  },
                  {
                    $expr: {
                      $in: ["$country", "$$countries"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "countries",
                let: {
                  countryId: "$country",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$_id", "$$countryId"],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: "taxes",
                      pipeline: [
                        {
                          $match: {
                            $and: [
                              {
                                $expr: {
                                  $eq: ["$countryId", "$$countryId"],
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
                          $project: {
                            name: 1,
                            tax: 1,
                          },
                        },
                      ],
                      as: "taxData",
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      taxData: 1,
                    },
                  },
                ],
                as: "countryData",
              },
            },
            {
              $unwind: {
                path: "$countryData",
              },
            },
            {
              $group: {
                _id: "$_id",
                name: {
                  $first: "$name",
                },
                countries: {
                  $push: "$countryData",
                },
              },
            },
            {
              $lookup: {
                from: "subproductcategories",
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
                    $project: {
                      name: 1,
                      masterVariant: 1,
                    },
                  },
                ],
                as: "subCategories",
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
          countries: "$result.countries",
          subCategories: "$result.subCategories",
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
    message: "Subcategories fetched seccessfully.",
    data,
    status: true,
  });
};

exports.getSubCategoryDependedData = async (req, res, next) => {
  const { subCategoryId } = req.params;
  let data;

  try {
    // [data] = await SubProductCategory.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(subCategoryId),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       let: {
    //         brandsIds: "$brands",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$brandsIds"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "brandsData",
    //     },
    //   },
    //   {
    //     $project: {
    //       features: 1,
    //       brandsData: 1,
    //       faqs: 1,
    //     },
    //   },
    // ]);
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
    message: "Data fetched successfully.",
    status: true,
    data,
  });
};

exports.getCategoryDependentData = async (req, res, next) => {
  const id = req.userId;
  const { categoryId } = req.params;

  let variants, masterCategory;

  try {
    // variants = Variant.aggregate([
    //   {
    //     $match: {
    //       isActive: true,
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subvariants",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$variantId", "$$id"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //             $or: [
    //               {
    //                 $expr: {
    //                   $eq: ["$vendorId", new ObjectId(id)],
    //                 },
    //               },
    //               {
    //                 vendorId: {
    //                   $exists: false,
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             name: 1,
    //             categoriesId: 1,
    //           },
    //         },
    //       ],
    //       as: "variants",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$variants",
    //     },
    //   },
    //   {
    //     $match: {
    //       "variants.categoriesId": {
    //         $in: [new ObjectId(subCategoryId)],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       subVariant: {
    //         id: "$variants._id",
    //         name: "$variants.name",
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       name: {
    //         $first: "$name",
    //       },
    //       subVariants: {
    //         $push: "$subVariant",
    //       },
    //     },
    //   },
    // ]);

    // masterCategory = SubProductCategory.findById(subCategoryId)
    //   .select("masterVariant")
    //   .lean();

    // [variants, masterCategory] = await Promise.all([variants, masterCategory]);

    [data] = await ProductCategory.aggregate([
      {
        $match: {
          _id: new ObjectId(categoryId),
        },
      },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            id: "$specificationIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$id"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
                specificationId: 1,
              },
            },
            {
              $lookup: {
                from: "subspecificationgroupdescriptions",
                let: {
                  subid: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$subid", "$subSpecificationId"],
                      },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      languageCode: 1,
                    },
                  },
                ],
                as: "langData",
              },
            },
            {
              $lookup: {
                from: "subspecificationgroupvalues",
                let: {
                  subid: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$subSpecificationId", "$$subid"],
                      },
                      isDeleted: false,
                    },
                  },
                  {
                    $sort: {
                      createdAt: 1,
                    },
                  },
                  {
                    $limit: 10,
                  },
                  {
                    $project: {
                      name: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "subspecificationgroupvaluedescriptions",
                      let: {
                        valueId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: [
                                "$subSpecificationGroupValueId",
                                "$$valueId",
                              ],
                            },
                          },
                        },
                        {
                          $project: {
                            name: 1,
                            languageCode: 1,
                          },
                        },
                      ],
                      as: "langData",
                    },
                  },
                ],
                as: "values",
              },
            },
          ],
          as: "specificationData",
        },
      },
      {
        $lookup: {
          from: "variants",
          let: {
            ids: "$variantIds",
            masterVariantId: "$masterVariantId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isDeleted: false,
                isActive: true,
              },
            },
            {
              $lookup: {
                from: "subvariants",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$variantId"],
                      },
                      isActive: true,
                      isDeleted: false,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      id: "$_id",
                      name: 1,
                    },
                  },
                ],
                as: "subVariants",
              },
            },
            {
              $addFields: {
                subVariantSize: {
                  $size: "$subVariants",
                },
              },
            },
            {
              $match: {
                subVariantSize: {
                  $gt: 0,
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                subVariants: 1,
                isMasterVariant: {
                  $eq: ["$_id", "$$masterVariantId"],
                },
              },
            },
          ],
          as: "variantData",
        },
      },
      {
        $project: {
          specificationData: 1,
          variantData: 1,
          requiredSpecificationIds: 1,
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

  // if (masterCategory) {
  //   let masterVariant = masterCategory.masterVariant;

  //   variants = variants.map((v) => {
  //     if (v._id.toString() == masterVariant.toString()) {
  //       v.isMasterVariant = true;
  //     } else {
  //       v.isMasterVariant = false;
  //     }
  //     return v;
  //   });
  // }

  res.status(200).json({
    status: true,
    message: "Category Dependent data fetched successfully.",
    // variants,
    data,
  });
};

exports.getAllProducts = async (req, res, next) => {
  const id = req.userId;
  const languageCode = req.languageCode;
  let {
    page,
    per_page,
    order,
    // sortBy = "createdAt",
    name,
    masterCategories,
    warehouses,
    brands,
    isPublished, //work on it
  } = req.body;

  let extras = {};
  name = name ?? "";

  if (
    masterCategories &&
    Array.isArray(masterCategories) &&
    masterCategories.length > 0 &&
    typeof masterCategories[0] === "string"
  ) {
    masterCategories = masterCategories.map((m) => new ObjectId(m));
    extras.categoryId = {
      $in: masterCategories,
    };
  }

  // if (
  //   warehouses &&
  //   Array.isArray(warehouses) &&
  //   warehouses.length > 0 &&
  //   typeof warehouses[0] === "string"
  // ) {
  //   warehouses = warehouses.map((m) => ObjectId(m));
  //   extras.warehouses = {
  //     $in: warehouses,
  //   };
  // }

  if (
    brands &&
    Array.isArray(brands) &&
    brands.length > 0 &&
    typeof brands[0] === "string"
  ) {
    brands = brands.map((m) => new ObjectId(m));
    extras.brandId = {
      $in: brands,
    };
  }

  per_page = +per_page;
  page = +page;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required",
      422
    );
    return next(error);
  }

  const newPipeline = [
    {
      $match: {
        vendorId: new ObjectId(id),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "products",
        let: {
          id: "$productId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              isDeleted: false,
              isActive: true,
              // isApproved: true,
              isPublished: true,
              ...extras,
            },
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productId", "$$id"],
                    },
                    languageCode: languageCode,
                    name: new RegExp(name, "i"),
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    shortDescription: 1,
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
        ],
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $lookup: {
        from: "productcategories",
        let: {
          id: "$product.categoryId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                  isActive: true,
                  isDeleted: false,
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
                    $expr: {
                      $eq: ["$productCategoryId", "$$id"],
                    },
                    languageCode: languageCode,
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
              // _id: 0,
              name: "$langData.name",
            },
          },
        ],
        as: "productcategories",
      },
    },
    {
      $lookup: {
        from: "brands",
        let: {
          id: "$product.brandId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                  isActive: true,
                  isDeleted: false,
                },
              ],
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "brandData",
      },
    },
    {
      $unwind: {
        path: "$productcategories",
      },
    },
    {
      $unwind: {
        path: "$brandData",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "buyingPriceCurrency",
        foreignField: "_id",
        as: "currencyData",
      },
    },
    {
      $unwind: {
        path: "$currencyData",
      },
    },
  ];

  let nativeCountry,
    products,
    totalProducts,
    allWarehouseAndMasterCat,
    allBrands;

  try {
    // allWarehouseAndMasterCat = Vendor.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "warehouses",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$vendor", "$$id"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             label: "$name",
    //             value: "$_id",
    //           },
    //         },
    //       ],
    //       as: "warehouseData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         ids: "$productCategories",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             label: "$name",
    //             value: "$_id",
    //           },
    //         },
    //       ],
    //       as: "masterCategories",
    //     },
    //   },
    //   {
    //     $project: {
    //       businessCountry: 1,
    //       warehouseData: 1,
    //       masterCategories: 1,
    //     },
    //   },
    // ]);
    // allBrands = Product.aggregate([
    //   {
    //     $match: {
    //       vendor: new ObjectId(id),
    //       isDeleted: false,
    //       isVendorActive: true,
    //       isHelper: false,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       let: {
    //         id: "$brandId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$_id", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             label: "$name",
    //             value: "$_id",
    //           },
    //         },
    //       ],
    //       as: "allBrands",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$allBrands",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$vendor",
    //       allBrands: {
    //         $addToSet: "$allBrands",
    //       },
    //     },
    //   },
    // ]);
    // [[allWarehouseAndMasterCat], [allBrands]] = await Promise.all([
    //   allWarehouseAndMasterCat,
    //   allBrands,
    // ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  nativeCountry = allWarehouseAndMasterCat?.businessCountry;

  let Pipeline = [
    {
      $match: {
        vendor: new ObjectId(id),
        isDeleted: false,
        name: new RegExp(name, "i"),
        isHelper: false,
        ...extras,
      },
    },
    {
      $lookup: {
        from: "productcategories",
        let: {
          id: "$masterCategoryId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                },
              ],
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "productcategories",
      },
    },
    {
      $unwind: {
        path: "$productcategories",
      },
    },
    {
      $lookup: {
        from: "brands",
        let: {
          id: "$brandId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$_id", "$$id"],
                  },
                },
              ],
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: "brandData",
      },
    },
    {
      $unwind: {
        path: "$brandData",
      },
    },
    {
      $addFields: {
        coverImage: {
          $filter: {
            input: "$media",
            as: "item",
            cond: {
              $eq: ["$$item.isFeatured", true],
            },
          },
        },
      },
    },
    {
      $unwind: {
        path: "$coverImage",
      },
    },
    {
      $addFields: {
        isCountryExits: {
          $in: ["$countries", [new ObjectId(nativeCountry)]],
        },
        firstCountry: {
          $first: "$countries",
        },
      },
    },
    {
      $addFields: {
        currencyCountry: {
          $cond: [
            "$isCountryExits",
            new ObjectId(nativeCountry),
            "$firstCountry",
          ],
        },
      },
    },
    {
      $addFields: {
        prices: {
          $filter: {
            input: "$prices",
            as: "item",
            cond: {
              $eq: ["$$item.countryId", "$currencyCountry"],
            },
          },
        },
      },
    },
    {
      $unwind: {
        path: "$prices",
      },
    },
    {
      $lookup: {
        from: "currencies",
        let: {
          id: "$prices.countryId",
        },
        pipeline: [
          {
            $unwind: {
              path: "$countriesId",
            },
          },
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$$id", "$countriesId"],
                  },
                },
              ],
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              name: 1,
              code: 1,
              sign: 1,
            },
          },
        ],
        as: "currency",
      },
    },
    {
      $unwind: {
        path: "$currency",
      },
    },
    {
      $addFields: {
        reviewsCount: 0,
        ratings: 0,
        discountPercentage: 0,
      },
    },
    {
      $project: {
        name: 1,
        brandName: "$brandData.name",
        coverImage: "$coverImage.src",
        currency: 1,
        prices: 1,
        quantity: 1,
        shortDescription: 1,
        masterCategoryName: "$productcategories.name",
        ratings: 1,
        discountPercentage: 1,
        reviewsCount: 1,
        isPublished: 1,
        isVendorActive: 1,
      },
    },
    {
      $sort: {
        // [sortBy]: order == "asc" ? 1 : -1,
        createdAt: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
  ];

  const paginationPipeline = [
    {
      $sort: {
        // [sortBy]: order == "asc" ? 1 : -1,
        createdAt: order == "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
    {
      $addFields: {
        reviewsCount: 0,
      },
    },
    {
      $project: {
        name: "$product.langData.name",
        brandName: "$brandData.name",
        coverImage: "$product.coverImage",
        // currency: {
        //   $literal: "$",
        // },
        // currency: {
        //   $literal: "$currencyData.sign",
        // },
        currency: "$currencyData.sign",
        // sellingPrice: 1,
        sellingPrice: "$discountedPrice",
        shortDescription: "$product.langData.shortDescription",
        masterCategoryName: "$productcategories.name",
        reviewsCount: 1,
        isActive: 1,
        isApproved: "$product.isApproved",
      },
    },
  ];

  try {
    // totalProducts = Product.aggregate([
    //   {
    //     $match: {
    //       vendor: new ObjectId(id),
    //       isDeleted: false,
    //       name: new RegExp(name, "i"),
    //       isHelper: false,
    //       ...extras,
    //     },
    //   },
    // ]);

    totalProducts = VendorProduct.aggregate(newPipeline);

    products = VendorProduct.aggregate([...newPipeline, ...paginationPipeline]);

    brandAndCategory = VendorProduct.aggregate([
      ...newPipeline,
      {
        $group: {
          _id: "x50",
          productcategories: {
            $addToSet: "$productcategories",
          },
          brandData: {
            $addToSet: "$brandData",
          },
        },
      },
      {
        $project: {
          productcategories: {
            $map: {
              input: "$productcategories",
              as: "item",
              in: {
                value: "$$item._id",
                label: "$$item.name",
                _id: "$$item._id",
                name: "$$item.name",
              },
            },
          },
          brandData: {
            $map: {
              input: "$brandData",
              as: "item",
              in: {
                value: "$$item._id",
                label: "$$item.name",
                _id: "$$item._id",
                name: "$$item.name",
              },
            },
          },
        },
      },
    ]);

    [totalProducts, products, [brandAndCategory]] = await Promise.all([
      totalProducts,
      products,
      brandAndCategory,
    ]);
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Product fetched successfully.",
    totalProducts: totalProducts.length ?? 0,
    products: products ?? [],
    status: true,
    warehouses: allWarehouseAndMasterCat?.warehouseData || [],
    masterCategories: brandAndCategory?.productcategories || [],
    allBrands: brandAndCategory?.brandData || [],
  });
};

exports.makeProductAsDraft = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await Product.findByIdAndUpdate(productId, { isPublished: false });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    productId,
    message: "Product set to draft successfully.",
  });
};

exports.makeProductPublish = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await Product.findByIdAndUpdate(productId, { isPublished: true });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      422
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    productId,
    message: "Product published successfully.",
  });
};
exports.getMostViewedItems = async (req, res, next) => {
  let userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let { perPage, page } = req.query;

  perPage = perPage ? +perPage : 6;
  page = page ? +page : 1;

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        coverImage: {
          $ne: null,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "descData",
            },
          },
          {
            $unwind: {
              path: "$descData",
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: "en",
                  },
                },
              ],
              as: "enDescData",
            },
          },
          {
            $unwind: {
              path: "$enDescData",
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: languageCode,
            },
          },
        ],
        as: "descData",
      },
    },
    {
      $unwind: {
        path: "$descData",
      },
    },
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: "en",
            },
          },
        ],
        as: "descEnglishData",
      },
    },
    {
      $unwind: {
        path: "$descEnglishData",
      },
    },
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.descData.slug", "$descData.slug"],
        },
        en_slug: {
          $ifNull: ["$variantData.enDescData.slug", "$descEnglishData.slug"],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        reviewsCount: 0,
        media: "$coverImage",
      },
    },
  ];

  let products, currencyData, totalProducts, currentCurrency, usdCurrency;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    //totalProducts = Product.aggregate(COMMON);

    let productsObj = Product.aggregate([
      ...COMMON,
      {
        $sort: {
          views: -1,
        },
      },
      /* {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      }, */
      ...wishlistObj.first,
      ...REVIEW_AGG.first,

      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $project: {
          name: "$descData.name",
          ratings: 1,
          discountPercentage: 1,
          reviewsCount: 1,
          shortDescription: "$descData.shortDescription",
          media: 1,
          price: 1,
          discountedPrice: 1,
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          en_slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          ...REVIEW_AGG.second,
          vendor: 1,
          idForCart: 1,
          typeForCart: 1,
        },
      },
      {
        $facet: {
          products: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    [[productsObj]] = await Promise.all([productsObj]);

    products = productsObj.products ? productsObj.products : [];
    totalProducts =
      productsObj.totalCount &&
      productsObj.totalCount.length > 0 &&
      productsObj.totalCount[0].count
        ? productsObj.totalCount[0].count
        : 0;
  } catch (err) {
    console.log("product -get most viewed -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      currency: "$",
      totalProducts: 0,
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    currency: "$",
    totalProducts: totalProducts,
  });
};

//updated
exports.getMostViewedItems_old = async (req, res, next) => {
  let userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let { perPage, page } = req.query;

  perPage = perPage ? +perPage : 6;
  page = page ? +page : 1;

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
      },
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "descData",
            },
          },
          {
            $unwind: {
              path: "$descData",
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: "en",
                  },
                },
              ],
              as: "enDescData",
            },
          },
          {
            $unwind: {
              path: "$enDescData",
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: languageCode,
            },
          },
        ],
        as: "descData",
      },
    },
    {
      $unwind: {
        path: "$descData",
      },
    },
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: "en",
            },
          },
        ],
        as: "descEnglishData",
      },
    },
    {
      $unwind: {
        path: "$descEnglishData",
      },
    },
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.descData.slug", "$descData.slug"],
        },
        en_slug: {
          $ifNull: ["$variantData.enDescData.slug", "$descEnglishData.slug"],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        reviewsCount: 0,
        media: "$coverImage",
      },
    },
  ];

  let products, currencyData, totalProducts, currentCurrency, usdCurrency;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    totalProducts = Product.aggregate(COMMON);

    products = Product.aggregate([
      ...COMMON,
      {
        $sort: {
          views: -1,
        },
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      ...wishlistObj.first,
      ...REVIEW_AGG.first,

      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $project: {
          name: "$descData.name",
          ratings: 1,
          discountPercentage: 1,
          reviewsCount: 1,
          shortDescription: "$descData.shortDescription",
          media: 1,
          price: 1,
          discountedPrice: 1,
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          en_slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          ...REVIEW_AGG.second,
          vendor: 1,
          idForCart: 1,
          typeForCart: 1,
        },
      },
    ]);

    [totalProducts, products] = await Promise.all([totalProducts, products]);
  } catch (err) {
    console.log("product -get most viewed -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      currency: "$",
      totalProducts: 0,
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    currency: "$",
    totalProducts: totalProducts?.length,
  });
};

//updatedy
exports.newlyLaunchedItems = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.userId;

  console.log("languageCode", languageCode);
  /*  console.log("userId",userId);
    console.log("currentCurrency",currentCurrency);
    console.log("usdCurrency",usdCurrency); */

  let { perPage, page } = req.query;

  perPage = perPage ? +perPage : 2;
  page = page ? +page : 1;

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        coverImage: {
          $ne: null,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "descData",
            },
          },
          {
            $unwind: {
              path: "$descData",
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: languageCode,
            },
          },
        ],
        as: "descData",
      },
    },
    {
      $unwind: {
        path: "$descData",
      },
    },
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.descData.slug", "$descData.slug"],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        views: {
          $ifNull: ["$variantData.views", "$views"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        reviewsCount: 0,
        media: "$coverImage",
      },
    },
  ];

  let products, currencyData, totalProducts, currentCurrency, usdCurrency;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    //totalProducts = Product.aggregate(COMMON);

    let productsObj = Product.aggregate([
      ...COMMON,
      ...REVIEW_AGG.first,
      {
        $sort: {
          createdAt: -1,
        },
      },
      /* {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      }, */
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $project: {
          name: "$descData.name",
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$descData.shortDescription",
          media: 1,
          price: 1,
          discountedPrice: 1,
          // discountedPrice: "$price",
          discountPercentage: 1,
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          vendor: 1,
          idForCart: 1,
          typeForCart: 1,
          ...REVIEW_AGG.second,
        },
      },
      {
        $facet: {
          products: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    [[productsObj]] = await Promise.all([productsObj]);

    products = productsObj.products ? productsObj.products : [];
    totalProducts =
      productsObj.totalCount &&
      productsObj.totalCount.length > 0 &&
      productsObj.totalCount[0].count
        ? productsObj.totalCount[0].count
        : 0;

    //[totalProducts, products] = await Promise.all([totalProducts, products]);
  } catch (err) {
    console.log("product -get newly launched -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      currency: "$",
      totalProducts: 0,
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    currency: "$",
    totalProducts: totalProducts,
  });
};

//updated
exports.getBySubCategory = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.userId;

  let {
    onSale = false,
    // subCategories = [],
    brands = [],
    minPrice,
    maxPrice,
    ratings,
    minDiscount,
    maxDiscount,
    // inStock,
    // outOfStock,
    page,
    sortBy, // priceAsc, priceDesc, new
    dynamicFilters = [],
    category, //slug
    subCategory, //slug
    perPage = 30,
    // childCategories = [],
    dynamicSpecifications = [],
  } = req.body;

  if (!page) {
    page = 1;
  }

  perPage = +perPage;

  if (!category || !subCategory) {
    return res.status(200).json({
      status: false,
      message: "Please provide both category and sub category.",
    });
  }

  let sortByKey = "createdAt";
  let sortByValue = 1;

  if (sortBy === "priceAsc") {
    sortByKey = "price";
    sortByValue = 1;
  } else if (sortBy === "priceDesc") {
    sortByKey = "price";
    sortByValue = -1;
  }

  let matchObj = {
    isDeleted: false,
  };

  let matchObjTwo = {};

  if (onSale) {
    matchObjTwo.discountPercentage = {
      $gt: 0,
    };
  }

  // if (subCategories.length > 0) {
  //   matchObj.subCategoryId = {
  //     $in: subCategories.map((sc) => ObjectId(sc)),
  //   };
  // }

  // if (childCategories.length > 0) {
  //   matchObj.categoriesId = {
  //     $in: childCategories.map((sc) => ObjectId(sc)),
  //   };
  // }

  if (brands.length > 0) {
    matchObj.brandId = {
      $in: brands.map((brand) => new ObjectId(brand)),
    };
  }

  if (minPrice && maxPrice) {
    //discountedPrice
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
      $lte: +maxPrice,
    };
  } else if (minPrice) {
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
    };
  } else if (maxPrice) {
    matchObjTwo.discountedPrice = {
      $lte: +maxPrice,
    };
  }

  if (ratings) {
    matchObjTwo.ratings = +ratings;
  }

  if (minDiscount && maxDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
      $lte: +maxDiscount,
    };
  } else if (minDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
    };
  } else if (maxDiscount) {
    matchObjTwo.discountPercentage = {
      $lte: +maxDiscount,
    };
  }

  // if (inStock && outOfStock) {
  //   matchObj.inStock = {
  //     $in: [true, false],
  //   };
  // } else if (inStock) {
  //   matchObj.inStock = {
  //     $in: [true],
  //   };
  // } else if (outOfStock) {
  //   matchObj.inStock = {
  //     $in: [false],
  //   };
  // }

  let DYNAMIC_FILTERS_PIPELINE = [];
  let DYNAMIC_SPECIFICATION_PIPELINE = [];

  if (dynamicFilters.length > 0) {
    const dynamicFiltersObj = {};

    for (let i = 0; i < dynamicFilters.length; i++) {
      const filter = dynamicFilters[i];

      if (dynamicFiltersObj[filter.id]) {
        dynamicFiltersObj[filter.id] = [
          ...dynamicFiltersObj[filter.id],
          filter.value,
        ];
      } else {
        dynamicFiltersObj[filter.id] = [filter.value];
      }
    }

    for (let key in dynamicFiltersObj) {
      const values = dynamicFiltersObj[key];

      const filtersAgg = [];

      values.forEach((value) => {
        filtersAgg.push({
          $and: [
            {
              "variantData.firstVariantId": new ObjectId(key),
            },
            {
              "variantData.firstSubVariantName": value.toString(),
            },
          ],
        });

        filtersAgg.push({
          $and: [
            {
              "variantData.secondVariantId": new ObjectId(key),
            },
            {
              "variantData.secondSubVariantName": value.toString(),
            },
          ],
        });
      });

      DYNAMIC_FILTERS_PIPELINE.push({
        $match: {
          $or: filtersAgg,
        },
      });
    }

    // DYNAMIC_FILTERS_PIPELINE = [
    //   {
    //     $match: {
    //       $or: filtersAgg,
    //     },
    //   },
    // ];
  }

  const specificationAgg = [];

  if (dynamicSpecifications.length > 0) {
    for (let i = 0; i < dynamicSpecifications.length; i++) {
      const specification = dynamicSpecifications[i];

      specificationAgg.push({
        $and: [
          {
            "features.id": new ObjectId(specification.id),
          },
          {
            "features.value": specification.value.toString(),
          },
        ],
      });
    }
    DYNAMIC_SPECIFICATION_PIPELINE = [
      {
        $lookup: {
          from: "subspecificationgroupvaluedescriptions",
          let: {
            ids: "$features.value",
            label: "$features.label",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$subSpecificationGroupValueId", "$$ids"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                subSpecificationGroupValueId: 1,
                name: 1,
                label: {
                  $arrayElemAt: ["$$label", 0],
                },
              },
            },
          ],
          as: "values",
        },
      },
      {
        $match: {
          $or: specificationAgg,
        },
      },
    ];
  }

  let categoryFilters;

  try {
    [categoryFilters] = await ProductCategoryDescription.aggregate([
      {
        $match: {
          slug: subCategory,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
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
          ],
          as: "subCategory",
        },
      },
      {
        $unwind: {
          path: "$subCategory",
        },
      },
      {
        $lookup: {
          from: "productcategorydescriptions",
          let: {
            productCategoryId: "$productCategoryId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productCategoryId", "$$productCategoryId"],
                },
                languageCode: languageCode,
              },
            },
            {
              $project: {
                _id: 0,
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
        $lookup: {
          from: "productcategories",
          let: {
            id: "$subCategory.parentId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
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
                  productCategoryId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$productCategoryId", "$$productCategoryId"],
                      },
                      languageCode: languageCode,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
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
          ],
          as: "mainCategory",
        },
      },
      {
        $unwind: {
          path: "$mainCategory",
        },
      },
      // {
      //   $lookup: {
      //     from: "specificationgroups",
      //     let: {
      //       ids: "$subCategory.specificationFilterIds",
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $in: ["$_id", "$$ids"],
      //           },
      //           isActive: true,
      //           isDeleted: false,
      //         },
      //       },
      //       {
      //         $lookup: {
      //           from: "subspecificationgroups",
      //           let: {
      //             id: "$_id",
      //           },
      //           pipeline: [
      //             {
      //               $match: {
      //                 $expr: {
      //                   $eq: ["$specificationId", "$$id"],
      //                 },
      //                 isActive: true,
      //                 isDeleted: false,
      //               },
      //             },
      //             {
      //               $sort: {
      //                 name: 1,
      //               },
      //             },
      //             {
      //               $project: {
      //                 _id: 1,
      //               },
      //             },
      //           ],
      //           as: "subData",
      //         },
      //       },
      //       {
      //         $project: {
      //           _id: 1,
      //           subData: {
      //             $map: {
      //               input: "$subData",
      //               as: "item",
      //               in: "$$item._id",
      //             },
      //           },
      //         },
      //       },
      //     ],
      //     as: "specificationGroupsData",
      //   },
      // },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            ids: "$subCategory.specificationFilterIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$ids"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $sort: {
                name: 1,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "specificationGroupsData",
        },
      },
      {
        $project: {
          subCategory: 1,
          variantIds: 1,
          name: 1,
          langData: 1,
          mainCategory: 1,
          // specificationGroupsData: 1,
          specificationGroupsData: {
            $map: {
              input: "$specificationGroupsData",
              as: "item",
              in: "$$item._id",
            },
          },
        },
      },
    ]);
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "Could not fetch products.",
      products: [],
      totalProducts: 0,
    });
  }

  if (!categoryFilters) {
    return res.status(200).json({
      status: false,
      message: "Invalid category or sub category.",
      products: [],
      totalProducts: 0,
    });
  }

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  let childCategoryIds = [];

  try {
    [childCategoryIds] = await ProductCategory.aggregate([
      {
        $match: {
          parentId: new ObjectId(categoryFilters.subCategory._id),
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          id: ["$_id"],
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
              },
            },
          ],
          as: "second",
        },
      },

      {
        $project: {
          id: 1,
          ids: {
            $concatArrays: [
              {
                $map: {
                  input: "$second",
                  as: "a",
                  in: "$$a._id",
                },
              },
              "$id",
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$ids",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "x50",
          ids: {
            $push: "$ids",
          },
          // nextIds: {
          //   $addToSet: "$_id",
          // },
        },
      },
    ]);
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "Could not fetch products.",
      products: [],
      totalProducts: 0,
      key: "childCategoryIds",
    });
  }

  if (!childCategoryIds) {
    childCategoryIds = {
      ids: [],
      nextIds: [],
    };
  }

  const commonMatch = {
    // categoryId: ObjectId(categoryFilters.subCategory._id),
    categoryId: {
      $in: [
        new ObjectId(categoryFilters.subCategory._id),
        ...childCategoryIds?.ids.map((id) => new ObjectId(id)),
      ],
    },
  };

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        // isVendorActive: true,
        // isHelper: false,
        // masterCategoryId: ObjectId("642e98fef95d77871e0eefdc"),
        ...commonMatch,
      },
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              ],
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
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productVariantId", "$$productVariantId"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
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
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        // price: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        slug: {
          $ifNull: ["$variantData.langData.slug", "$langData.slug"],
        },
        name: {
          $cond: [
            "$variantData",
            {
              $cond: [
                "$variantData.secondVariantName",
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ",",
                    "$variantData.secondSubVariantName",
                    ")",
                  ],
                },
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ")",
                  ],
                },
              ],
            },
            "$langData.name",
          ],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        // discountPercentage: 0,
        reviewsCount: 0,
        // pricesFiltered: {
        //   $filter: {
        //     input: "$prices",
        //     cond: {
        //       $eq: ["$$item.countryId", new ObjectId(countryId)],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
        // media: {
        //   $filter: {
        //     input: "$media",
        //     cond: {
        //       $eq: ["$$item.isFeatured", true],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
      },
    },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$media",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     price: "$pricesFiltered.sellingPrice",
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //     discountPercentage: {
    //       $round: [
    //         {
    //           $subtract: [
    //             100,
    //             {
    //               $divide: [
    //                 {
    //                   $multiply: ["$pricesFiltered.discountPrice", 100],
    //                 },
    //                 "$pricesFiltered.sellingPrice",
    //               ],
    //             },
    //           ],
    //         },
    //         2,
    //       ],
    //     },
    //   },
    // },
    {
      $match: {
        ...matchObj,
      },
    },
    ...DYNAMIC_FILTERS_PIPELINE,
    {
      $addFields: {
        features: {
          $map: {
            input: "$langData.features",
            as: "item",
            in: {
              label: "$$item.label",
              value: "$$item.value",
              id: {
                $toObjectId: "$$item.id",
              },
            },
          },
        },
      },
    },
    ...DYNAMIC_SPECIFICATION_PIPELINE,
  ];

  const PRICES_COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        // isVendorActive: true,
        // isHelper: false,
        ...commonMatch,
      },
    },
    //added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    //added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          //added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        // prices: {
        //   $ifNull: ["$variantData.prices", "$prices"],
        // },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    // {
    //   $addFields: {
    //     pricesFiltered: {
    //       $filter: {
    //         input: "$prices",
    //         cond: {
    //           $eq: ["$$item.countryId", new ObjectId(countryId)],
    //         },
    //         as: "item",
    //         limit: 1,
    //       },
    //     },
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $addFields: {
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //   },
    // },
  ];

  const FILTERS_COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        // isVendorActive: true,
        // isHelper: false,
        ...commonMatch,
      },
    },
    //added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    //added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: false,
      },
    },
    ...COMMON_AGG,
  ];

  let products,
    minPriceData,
    maxPriceData,
    totalProducts,
    currencyData,
    brandData,
    filtersOne = [],
    filtersTwo = [],
    childCategoriesData,
    specifications,
    currentCurrency,
    usdCurrency;

  try {
    // [currencyData] = await Currency.aggregate([
    //   {
    //     $match: {
    //       countriesId: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $limit: 1,
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sign: 1,
    //     },
    //   },
    // ]);

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    products = Product.aggregate([
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $match: {
          ...matchObjTwo,
        },
      },
      {
        $sort: {
          [sortByKey]: sortByValue,
        },
      },
      {
        $skip: (+page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      ...wishlistObj.first,
      ...REVIEW_AGG.first,
      {
        $project: {
          // name: "$langData.name",
          name: 1,
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$langData.shortDescription",
          media: "$coverImage",
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          ...REVIEW_AGG.second,
          vendor: 1,
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          idForCart: 1,
          typeForCart: 1,
        },
      },
    ]);

    minPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: 1,
          // price: 1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]);

    maxPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: -1,
          // price: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]);

    brandData = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
          // isVendorActive: true,
          // isHelper: false,
          ...commonMatch,
        },
      },
      //added new start
      {
        $lookup: {
          from: "vendorproducts",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$id"],
                },
                isDeleted: false,
                isActive: true,
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "vendorData",
        },
      },
      {
        $unwind: {
          path: "$vendorData",
        },
      },
      //added new end
      {
        $group: {
          _id: "x50",
          // subCategoriesId: {
          //   $addToSet: "$subCategoryId",
          // },
          brandsId: {
            $addToSet: "$brandId",
          },
        },
      },
      // {
      //   $lookup: {
      //     from: "subproductcategories",
      //     let: {
      //       ids: "$subCategoriesId",
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $and: [
      //             {
      //               $expr: {
      //                 $in: ["$_id", "$$ids"],
      //               },
      //             },
      //           ],
      //         },
      //       },
      //       {
      //         $project: {
      //           name: 1,
      //         },
      //       },
      //     ],
      //     as: "subCategoriesData",
      //   },
      // },
      {
        $lookup: {
          from: "brands",
          let: {
            ids: "$brandsId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "brandsData",
        },
      },
      {
        $project: {
          // subCategoriesId: 0,
          brandsId: 0,
        },
      },
    ]);

    totalProducts = Product.aggregate(COMMON);

    if (categoryFilters.subCategory.variantFilterIds) {
      filtersOne = Product.aggregate([
        ...FILTERS_COMMON,
        {
          $match: {
            "variantData.firstVariantId": {
              // $in: [
              //   new ObjectId("64394b2cc1d4d239d9565aa0"),
              //   new ObjectId("642e98e4f95d77871e0eefc2"),
              // ],
              $in: categoryFilters.subCategory.variantFilterIds.map(
                (v) => new ObjectId(v)
              ),
            },
          },
        },
        {
          $group: {
            _id: "$variantData.firstVariantId",
            name: {
              $first: "$variantData.firstVariantName",
            },
            values: {
              $addToSet: "$variantData.firstSubVariantName",
            },
            valuesId: {
              $addToSet: "$variantData.firstSubVariantId",
            },
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPages: "$valuesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$mainPage", "$$mainPages"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "firstSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$firstVariantIdLangData",
          },
        },
        {
          $addFields: {
            langName: "$firstVariantIdLangData.name",
            langValues: {
              $map: {
                input: "$firstSubVariantIdLangData",
                as: "variant",
                in: "$$variant.name",
              },
            },
          },
        },
      ]);

      filtersTwo = Product.aggregate([
        ...FILTERS_COMMON,
        {
          $match: {
            "variantData.secondVariantId": {
              $in: categoryFilters.subCategory.variantFilterIds.map(
                (v) => new ObjectId(v)
              ),
            },
          },
        },
        {
          $group: {
            _id: "$variantData.secondVariantId",
            name: {
              $first: "$variantData.secondVariantName",
            },
            values: {
              $addToSet: "$variantData.secondSubVariantName",
            },
            valuesId: {
              $addToSet: "$variantData.secondSubVariantId",
            },
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPage: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$mainPage", "$$mainPage"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondVariantIdLangData",
          },
        },
        {
          $lookup: {
            from: "masterdescriptions",
            let: {
              mainPages: "$valuesId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$mainPage", "$$mainPages"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
            as: "secondSubVariantIdLangData",
          },
        },
        {
          $unwind: {
            path: "$secondVariantIdLangData",
          },
        },
        {
          $addFields: {
            langName: "$secondVariantIdLangData.name",
            langValues: {
              $map: {
                input: "$secondSubVariantIdLangData",
                as: "variant",
                in: "$$variant.name",
              },
            },
          },
        },
      ]);
    }

    if (categoryFilters.subCategory.specificationFilterIds) {
      specifications = Product.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            isPublished: true,
            isApproved: true,
            // isVendorActive: true,
            // isHelper: false,
            // countries: {
            //   $in: [new ObjectId(countryId)],
            // },
            ...commonMatch,
          },
        },
        //added new start
        {
          $lookup: {
            from: "vendorproducts",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  isDeleted: false,
                  isActive: true,
                },
              },
              {
                $sort: {
                  createdAt: 1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "vendorData",
          },
        },
        {
          $unwind: {
            path: "$vendorData",
          },
        },
        //added new end
        {
          $lookup: {
            from: "productdescriptions",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              },
              {
                $project: {
                  features: 1,
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
          $unwind: {
            path: "$langData.features",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$langData.features",
          },
        },
        // {
        //   $group: {
        //     _id: "$id",
        //     name: {
        //       $first: "$label",
        //     },
        //     values: {
        //       $addToSet: "$value",
        //     },
        //   },
        // },
        {
          $group: {
            _id: "$label",
            values: {
              $addToSet: "$value",
            },
          },
        },
        {
          $lookup: {
            from: "subspecificationgroups",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$_id"],
                  },
                  isActive: true,
                  isDeleted: false,
                },
              },
              {
                $lookup: {
                  from: "subspecificationgroupdescriptions",
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$subSpecificationId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                    {
                      $project: {
                        name: 1,
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
            ],
            as: "groupData",
          },
        },
        {
          $unwind: {
            path: "$groupData",
          },
        },
        {
          $lookup: {
            from: "subspecificationgroupvalues",
            let: {
              ids: "$values",
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
                $lookup: {
                  from: "subspecificationgroupvaluedescriptions",
                  let: {
                    id: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$subSpecificationGroupValueId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    },
                    {
                      $project: {
                        name: 1,
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
                  _id: 0,
                  name: "$langData.name",
                },
              },
            ],
            as: "values",
          },
        },
        {
          $project: {
            name: "$groupData.name",
            values: {
              $map: {
                input: "$values",
                as: "item",
                in: "$$item.name",
              },
            },
          },
        },
      ]);
    }

    // childCategoriesData = await Category.aggregate([
    //   {
    //     $match: {
    //       parentId: new ObjectId(categoryFilters.subCategory._id),
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

    [
      products,
      [minPriceData],
      [maxPriceData],
      totalProducts,
      [brandData],
      filtersOne,
      filtersTwo,
      childCategoriesData,
      specifications,
    ] = await Promise.all([
      products,
      minPriceData,
      maxPriceData,
      totalProducts,
      brandData,
      filtersOne,
      filtersTwo,
      childCategoriesData,
      specifications,
    ]);
  } catch (err) {
    console.log("product -get -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
      brands: [],
      // subCategories: [],
      filters: [],
      childCategoriesData: [],
    });
  }

  let filters = [];
  const newFilters = [];

  if (filtersOne.length > 0 && filtersTwo.length > 0) {
    // filtersOne.forEach((filter) => {});

    for (let i = 0; i < filtersOne.length; i++) {
      const filter = filtersOne[i];
      const common = filtersTwo.find(
        (f) => f._id.toString() == filter._id.toString()
      );
      if (!common) {
        filters.push({
          _id: filter._id,
          name: filter.langName,
          values: filter.langValues,
        });
      } else {
        let unique = new Set([...filter.langValues, ...common.langValues]);
        unique = [...unique];

        filters.push({
          _id: filter._id,
          name: filter.langName,
          values: unique,
        });
      }
    }

    for (let i = 0; i < filtersTwo.length; i++) {
      const filter = filtersTwo[i];
      const isAdded = filters.find(
        (f) => f._id.toString() == filter._id.toString()
      );
      if (!isAdded) {
        filters.push({
          _id: filter._id,
          name: filter.langName,
          // values: unique,
          values: filter.langValues,
        });
      }
    }

    // filtersTwo.forEach((filter) => {});
  } else if (filtersOne.length > 0) {
    filters = filtersOne.map((f) => ({
      _id: f._id,
      name: f.langName,
      values: f.langValues,
    }));
  } else if (filtersTwo.length > 0) {
    filters = filtersTwo.map((f) => ({
      _id: f._id,
      name: f.langName,
      values: f.langValues,
    }));
  }

  const filterIds = categoryFilters.subCategory.variantFilterIds;

  filterIds.forEach((f) => {
    const isExist = filters.find(
      (filter) => filter._id.toString() == f.toString()
    );
    if (isExist) {
      newFilters.push(isExist);
    }
  });

  let newSpecifications = [];

  if (specifications.length > 0) {
    categoryFilters.specificationGroupsData.forEach((sp) => {
      // sp.subData.forEach((sub) => {
      const isExist = specifications.find(
        (s) => s._id.toString() == sp.toString()
      );

      if (isExist) {
        newSpecifications.push(isExist);
      }
      // });
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    minPrice: minPriceData?.price ?? 0,
    maxPrice: maxPriceData?.price ?? 0,
    totalProducts: totalProducts?.length,
    currency: "$",
    brands: brandData?.brandsData ?? [],
    // subCategories: brandData?.subCategoriesData ?? [],
    filters: newFilters,
    categoryData: {
      name: categoryFilters.name,
      subCategory: categoryFilters.subCategory.name,
      slug: categoryFilters.langData.slug,
      metaData: categoryFilters.langData.metaData,
      main: {
        slug: categoryFilters.mainCategory.langData.slug,
        metaData: categoryFilters.mainCategory.langData.metaData,
      },
    },
    childCategoriesData: [],
    specifications: newSpecifications,
  });
};

exports.getByBrand = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;
  let userId = req.userId;

  let {
    onSale = false,
    // subCategories = [],
    minPrice,
    maxPrice,
    ratings,
    minDiscount,
    maxDiscount,
    // inStock,
    // outOfStock,
    page,
    sortBy, // priceAsc, priceDesc, new
    brand,
    perPage = 30,
    // childCategories = [],
  } = req.body;

  if (!page) {
    page = 1;
  }

  perPage = +perPage;

  if (!brand) {
    return res.status(200).json({
      status: false,
      message: "Please provide brand.",
    });
  }

  let sortByKey = "createdAt";
  let sortByValue = 1;

  if (sortBy === "priceAsc") {
    sortByKey = "price";
    sortByValue = 1;
  } else if (sortBy === "priceDesc") {
    sortByKey = "price";
    sortByValue = -1;
  }

  let matchObj = {
    isDeleted: false,
  };

  let matchObjTwo = {};

  if (onSale) {
    matchObjTwo.discountPercentage = {
      $gt: 0,
    };
  }

  // if (subCategories.length > 0) {
  //   matchObj.subCategoryId = {
  //     $in: subCategories.map((sc) => ObjectId(sc)),
  //   };

  //   if (childCategories.length > 0) {
  //     matchObj.categoriesId = {
  //       $in: childCategories.map((sc) => ObjectId(sc)),
  //     };
  //   }
  // }

  if (minPrice && maxPrice) {
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
      $lte: +maxPrice,
    };
  } else if (minPrice) {
    matchObjTwo.discountedPrice = {
      $gte: +minPrice,
    };
  } else if (maxPrice) {
    matchObjTwo.discountedPrice = {
      $lte: +maxPrice,
    };
  }

  if (ratings) {
    matchObjTwo.ratings = +ratings;
  }

  if (minDiscount && maxDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
      $lte: +maxDiscount,
    };
  } else if (minDiscount) {
    matchObjTwo.discountPercentage = {
      $gte: +minDiscount,
    };
  } else if (maxDiscount) {
    matchObjTwo.discountPercentage = {
      $lte: +maxDiscount,
    };
  }

  // if (inStock && outOfStock) {
  //   matchObj.inStock = {
  //     $in: [true, false],
  //   };
  // } else if (inStock) {
  //   matchObj.inStock = {
  //     $in: [true],
  //   };
  // } else if (outOfStock) {
  //   matchObj.inStock = {
  //     $in: [false],
  //   };
  // }

  let brandData;

  try {
    // brandData = await Brand.findOne({
    //   slug: brand,
    //   isActive: true,
    //   isDeleted: false,
    // })
    //   .select("_id name")
    //   .lean();

    [brandData] = await MasterDescription.aggregate([
      {
        $match: {
          slug: brand,
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
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
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
        $replaceRoot: {
          newRoot: "$result",
        },
      },
    ]);
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "Could not fetch products.",
      products: [],
      totalProducts: 0,
    });
  }

  if (!brandData) {
    return res.status(200).json({
      status: false,
      message: "Invalid brand.",
      products: [],
      totalProducts: 0,
    });
  }

  const commonMatch = {
    brandId: new ObjectId(brandData._id),
  };

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        // isVendorActive: true,
        // isHelper: false,
        // masterCategoryId: ObjectId("642e98fef95d77871e0eefdc"),
        ...commonMatch,
      },
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  languageCode: languageCode,
                },
              ],
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
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productVariantId", "$$productVariantId"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    name: 1,
                    slug: 1,
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
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.langData.slug", "$langData.slug"],
        },
        name: {
          $cond: [
            "$variantData",
            {
              $cond: [
                "$variantData.secondVariantName",
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ",",
                    "$variantData.secondSubVariantName",
                    ")",
                  ],
                },
                {
                  $concat: [
                    "$langData.name",
                    " (",
                    "$variantData.firstSubVariantName",
                    ")",
                  ],
                },
              ],
            },
            "$langData.name",
          ],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        // discountPercentage: 0,
        reviewsCount: 0,
        // pricesFiltered: {
        //   $filter: {
        //     input: "$prices",
        //     cond: {
        //       $eq: ["$$item.countryId", new ObjectId(countryId)],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
        // media: {
        //   $filter: {
        //     input: "$media",
        //     cond: {
        //       $eq: ["$$item.isFeatured", true],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
      },
    },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$media",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     price: "$pricesFiltered.sellingPrice",
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //     discountPercentage: {
    //       $round: [
    //         {
    //           $subtract: [
    //             100,
    //             {
    //               $divide: [
    //                 {
    //                   $multiply: ["$pricesFiltered.discountPrice", 100],
    //                 },
    //                 "$pricesFiltered.sellingPrice",
    //               ],
    //             },
    //           ],
    //         },
    //         2,
    //       ],
    //     },
    //   },
    // },
    {
      $match: {
        ...matchObj,
      },
    },
  ];

  const PRICES_COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        // countries: {
        //   $in: [new ObjectId(countryId)],
        // },
        // isVendorActive: true,
        // isHelper: false,
        ...commonMatch,
      },
    },
    //added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    //added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          //added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        // price: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        // discountedPrice: {
        //   $ifNull: [
        //     "$variantData.vendorData.sellingPrice",
        //     "$vendorData.sellingPrice",
        //   ],
        // },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    // {
    //   $addFields: {
    //     pricesFiltered: {
    //       $filter: {
    //         input: "$prices",
    //         cond: {
    //           $eq: ["$$item.countryId", new ObjectId(countryId)],
    //         },
    //         as: "item",
    //         limit: 1,
    //       },
    //     },
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $addFields: {
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //   },
    // },
  ];

  let products,
    minPriceData,
    maxPriceData,
    totalProducts,
    currencyData,
    subCatData,
    currentCurrency,
    usdCurrency;

  try {
    // [currencyData] = await Currency.aggregate([
    //   {
    //     $match: {
    //       countriesId: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $limit: 1,
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sign: 1,
    //     },
    //   },
    // ]);

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    products = Product.aggregate([
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      },
      {
        $sort: {
          [sortByKey]: sortByValue,
        },
      },
      {
        $skip: (+page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      ...wishlistObj.first,
      {
        $project: {
          name: "$langData.name",
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$langData.shortDescription",
          media: "$coverImage",
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          shareUrl: {
            $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
          },
          idForCart: 1,
          typeForCart: 1,
        },
      },
    ]);

    minPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: 1,
          // price: 1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]);

    maxPriceData = Product.aggregate([
      ...PRICES_COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      {
        $sort: {
          discountedPrice: -1,
          // price: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          price: "$discountedPrice",
          // price: 1,
        },
      },
    ]);

    // subCatData = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       isPublished: true,
    //       // isApproved: true,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //       isVendorActive: true,
    //       isHelper: false,
    //       ...commonMatch,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "x50",
    //       subCategoriesId: {
    //         $addToSet: "$subCategoryId",
    //       },
    //       brandsId: {
    //         $addToSet: "$brandId",
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subproductcategories",
    //       let: {
    //         ids: "$subCategoriesId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "subCategoriesData",
    //     },
    //   },
    //   {
    //     $project: {
    //       subCategoriesId: 0,
    //     },
    //   },
    // ]);

    totalProducts = Product.aggregate([
      ...COMMON,
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...REVIEW_AGG.first,
      {
        $addFields: REVIEW_AGG.second,
      },
      {
        $match: {
          ...matchObjTwo,
        },
      },
    ]);

    [products, [minPriceData], [maxPriceData], totalProducts, subCatData] =
      await Promise.all([
        products,
        minPriceData,
        maxPriceData,
        totalProducts,
        subCatData,
      ]);
  } catch (err) {
    console.log("product -get -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      minPrice: 0,
      maxPrice: 1000,
      totalProducts: 0,
      currency: "$",
      subCategories: [],
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    minPrice: minPriceData?.price ?? 0,
    maxPrice: maxPriceData?.price ?? 0,
    totalProducts: totalProducts?.length,
    currency: "$",
    subCategories: [],
    brandData: {
      name: brandData.name,
    },
  });
};

exports.addProduct = async (req, res, next) => {
  const vendor = req.userId;
  const language = req.languageCode;

  let {
    name,
    barCode,
    hsCode,
    // masterCategoryId,
    // subCategoryId,
    categoryId,
    brandId,
    unitId,
    // warehouses,
    // quantity,
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    discountedPrice,
    // serialNumber,
    // featureTitle,
    // prices,
    shortDescription,
    longDescription,
    // taxesData,
    features,
    faqs,
    // isPublished,
    // inStock,
    featuredMediaId,
    // metaData,
    // countries,
    mediaIds,
    height,
    weight,
    width,
    length,
    dc,
    shippingCompany,
    variants,
    subVariants,
    alternateProductIds,
  } = req.body;

  // warehouses = JSON.parse(warehouses);
  features = JSON.parse(features);
  // metaData = JSON.parse(metaData);
  mediaIds = JSON.parse(mediaIds);
  variants = JSON.parse(variants);
  subVariants = JSON.parse(subVariants);
  faqs = JSON.parse(faqs);

  // prices = JSON.parse(prices);
  // taxesData = JSON.parse(taxesData);
  // countries = JSON.parse(countries);
  alternateProductIds = JSON.parse(alternateProductIds);

  // if (req.files.ogImage) {
  //   metaData.ogImage = req.files.ogImage[0].path;
  // }

  const allMedia = [];

  if (req.files.media) {
    req.files.media.forEach((m, idx) => {
      allMedia.push({ src: m.path, isImage: !VIDEO.includes(m.mimetype) });
    });
  }

  /*
  let addProductObj = {};

  if (language === languageCode) {
    addProductObj = {
      features,
      faqs,
      shortDescription,
      longDescription,
    };
  } else {
    addProductObj = {
      shortDescription: " ",
      longDescription: " ",
      features: [],
      faqs: [],
      // features: features.map((f) => ({
      //   label: " ",
      //   value: " ",
      // })),
      // faqs: faqs.map((f) => ({
      //   question: " ",
      //   answer: " ",
      // })),
    };
  }
  */

  let newData = new Product({
    name,
    barCode,
    hsCode,
    // masterCategoryId,
    // subCategoryId,
    categoryId,
    brandId,
    unitId,
    // warehouses,
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    // prices,
    // taxes: taxesData,
    // quantity,
    // serialNumber,
    // featureTitle,
    // ...addProductObj,
    // features,
    // faqs,
    // shortDescription,
    // longDescription,
    height,
    weight,
    width,
    length,
    dc,
    shippingCompany,
    alternateProducts: alternateProductIds,
    // metaData,
    // vendor,
    // countries,
    variants,
    isPublished: false,
    // inStock,
    // media: mediaIds["main"].map((m, idx) => {
    //   return {
    //     ...allMedia[m],
    //     isFeatured: idx === +featuredMediaId,
    //   };
    // }),
    media: mediaIds["main"].map((m, idx) => allMedia[m]),
    coverImage: mediaIds["main"].map((m, idx) => {
      return allMedia[m];
    })[+featuredMediaId].src,
    isApproved: false,
  });

  const mediaHandler = (idx) => {
    const media = [];
    //work on it please
    mediaIds[idx]?.forEach((m) => {
      media.push(allMedia[m]);
    });
    return media;
  };

  try {
    // const setting = await Setting.findOne({ key: "Product.approval" });

    // if (setting.selected === "false") {
    //   newData.isApproved = true;
    // }

    await newData.save();

    const promises = [];

    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i];
      let obj = {
        productId: newData._id,
        languageCode: lang.code,
        name: `${name} ${lang.default ? "" : ` ${lang.code}`}`,
        shortDescription: lang.default ? shortDescription : " ",
        longDescription: lang.default ? longDescription : " ",
        features: features,
        // faqs: lang.default ? faqs : [],
        faqs,
      };

      obj = new ProductDescription(obj);
      promises.push(obj.save());
    }

    if (subVariants.length > 0) {
      // await ProductVariant.insertMany(
      //   subVariants.map((data, idx) => ({
      //     ...data,
      //     mainProductId: newData._id,
      //     media: mediaHandler(idx),
      //     name,
      //     slug: `${newData.slug}-${idx}`,
      //   }))
      // );

      // newData.variantId = subVariants.length - 1;
      // await newData.save();

      for (let i = 0; i < subVariants.length; i++) {
        let obj = {
          ...subVariants[i],
          mainProductId: newData._id,
          media: mediaHandler(i),
          isActive: true,
        };

        obj = new ProductVariant(obj);
        await obj.save();
        // promises.push(obj.save());

        let newVendorProductVariant = new VendorProductVariant({
          vendorId: vendor,
          mainProductId: newData._id,
          productVariantId: obj._id,
          buyingPrice: subVariants[i].buyingPrice,
          sellingPrice: subVariants[i].sellingPrice,
          buyingPriceCurrency: subVariants[i].buyingPriceCurrency,
          discountedPrice: subVariants[i].discountedPrice,
          isActive: subVariants[i].isActive,
        });

        promises.push(newVendorProductVariant.save());

        for (let j = 0; j < languages.length; j++) {
          const lang = languages[j];
          let subObj = {
            productVariantId: obj._id,
            languageCode: lang.code,
            // name: langData[j].name,
            // slug: `${langData[j].slug}-${i}`,
            name: `${name} ${lang.default ? "" : ` ${lang.code}-${i}`}`,
          };

          subObj = new ProductVariantDescription(subObj);
          promises.push(subObj.save());
        }
      }

      newData.variantId = subVariants.length - 1;
      promises.push(newData.save());
    }

    // const langPromise = [];

    // langPromise.concat(
    //   MasterDescription.insertMany(
    //     languages.map((lang) => ({
    //       languageCode: lang.code,
    //       shortDescription: language === lang.code ? shortDescription : " ",
    //       longDescription: language === lang.code ? longDescription : " ",
    //       mainPage: newData._id,
    //       key: "productDesc",
    //     }))
    //   )
    // );

    // const featuresLang = [];
    // const faqsLang = [];

    // languages.forEach((lang) => {
    //   featuresLang.push({
    //     languageCode: lang.code,
    //     features:
    //       language === lang.code
    //         ? features
    //         : features.map((f) => ({
    //             label: " ",
    //             value: " ",
    //           })),
    //     mainPage: newData._id,
    //     key: "productFeatures",
    //   });

    //   faqsLang.push({
    //     languageCode: lang.code,
    //     mainPage: newData._id,
    //     faqs:
    //       language === lang.code
    //         ? faqs
    //         : faqs.map((f) => ({
    //             question: " ",
    //             answer: " ",
    //           })),
    //     key: "productFaqs",
    //   });
    // });

    // languages.forEach((lang) => {
    //   features.forEach((f) => {
    //     featuresLang.push({
    //       languageCode: lang.code,
    //       label: language === lang.code ? f.label : " ",
    //       value: language === lang.code ? f.value : " ",
    //       mainPage: newData._id,
    //       key: "productFeatures",
    //     });
    //   });

    //   faqs.forEach((f) => {
    //     faqsLang.push({
    //       languageCode: lang.code,
    //       question: language === lang.code ? f.question : " ",
    //       answer: language === lang.code ? f.answer : " ",
    //       mainPage: newData._id,
    //       key: "productFaqs",
    //     });
    //   });
    // });

    // langPromise.concat(MasterDescription.insertMany(featuresLang));

    // langPromise.concat(MasterDescription.insertMany(faqsLang));

    const newVendorProduct = new VendorProduct({
      vendorId: vendor,
      productId: newData._id,
      buyingPrice,
      sellingPrice,
      discountedPrice,
      buyingPriceCurrency,
      isActive: false,
    });

    promises.push(newVendorProduct.save());

    await Promise.all(promises);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create product.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Product Created Successfully",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;
  const vendor = req.userId;

  try {
    let vendorProductRes = await VendorProduct.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        vendorId: new ObjectId(vendor),
      },
      {
        $set: {
          isDeleted: true,
          isActive: false,
        },
      },
      {
        new: true,
      }
    );

    VendorProductVariant.updateMany(
      {
        vendorId: new ObjectId(vendor),
        mainProductId: new ObjectId(vendorProductRes.productId.toString()),
      },
      {
        isDeleted: true,
        isActive: false,
      }
    )
      .then()
      .catch();
    // if (response) {
    //   await ProductVariant.updateMany(
    //     { mainProductId: ObjectId(id) },
    //     {
    //       $set: {
    //         isDeleted: true,
    //       },
    //     }
    //   );
    // }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete product.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product deleted successfully.",
    id,
  });
};

exports.increaseQuantity = async (req, res, next) => {
  const { id } = req.body;
  const vendor = req.userId;

  try {
    const response = await Product.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        vendor: new ObjectId(vendor),
      },
      {
        $inc: {
          quantity: 1,
        },
      },
      {
        new: true,
      }
    );

    if (response) {
      await ProductVariant.updateMany(
        { mainProductId: new ObjectId(id), isDeleted: false },
        {
          $inc: {
            quantity: 1,
          },
        }
      );
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update quantity",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product quantity increased successfully.",
    id,
  });
};

exports.changeIsVendorActiveStatus = async (req, res, next) => {
  const { id, status } = req.body;
  const vendor = req.userId;

  try {
    await VendorProduct.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        vendor: new ObjectId(vendor),
      },
      {
        $set: {
          isActive: status,
        },
      }
    );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change Product's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's status changed successfully.",
    id,
    newStatus: status,
  });
};

//updated
exports.getSponsoredItems = async (req, res, next) => {
  let userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  let { perPage, page } = req.query;

  perPage = perPage ? +perPage : 5;
  page = page ? +page : 1;

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  const COMMON = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        isSponsored: true,
        coverImage: {
          $ne: null,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    // added new start
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "descData",
            },
          },
          {
            $unwind: {
              path: "$descData",
            },
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: "en",
                  },
                },
              ],
              as: "descEnLangData",
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: languageCode,
            },
          },
        ],
        as: "descData",
      },
    },
    {
      $unwind: {
        path: "$descData",
      },
    },
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: "en",
            },
          },
        ],
        as: "descEnLangData",
      },
    },
    ...COMMON_AGG,
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.descData.slug", "$descData.slug"],
        },
        en_slug: {
          $ifNull: ["$variantData.descEnLangData.slug", "$descEnLangData.slug"],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        views: {
          $ifNull: ["$variantData.views", "$views"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        }
      },
    },
    {
      $addFields: {
        ratings: 0,
        reviewsCount: 0,
        media: "$coverImage",
      },
    },
  ];

  let products, currencyData, totalProducts, currentCurrency, usdCurrency;

  try {
    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    //totalProducts = Product.aggregate(COMMON);

    let productsObj = Product.aggregate([
      ...COMMON,
      {
        $sort: {
          createdAt: 1,
        },
      },
      /*  {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      }, */
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...wishlistObj.first,
      ...REVIEW_AGG.first,
      {
        $project: {
          name: "$descData.name",
          ratings: 1,
          reviewsCount: 1,
          shortDescription: "$descData.shortDescription",
          media: 1,
          price: 1,
          discountedPrice: 1,
          discountPercentage: 1,
          // currency: { $literal: currencyData.sign },
          // currency: { $literal: "$" },
          currency: { $literal: currentCurrency.sign },
          slug: 1,
          en_slug: 1,
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          ...REVIEW_AGG.second,
          vendor: 1,
          idForCart: 1,
          typeForCart: 1
        },
      },
      {
        $facet: {
          products: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    [[productsObj]] = await Promise.all([productsObj]);

    products = productsObj.products ? productsObj.products : [];
    totalProducts =
      productsObj.totalCount &&
      productsObj.totalCount.length > 0 &&
      productsObj.totalCount[0].count
        ? productsObj.totalCount[0].count
        : 0;

        //console.log(products,"products");

    //[totalProducts, products] = await Promise.all([products, totalProducts]);
  } catch (err) {
    console.log("product -get sponsored -err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      currency: "$",
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    currency: "$",
    totalProducts: totalProducts,
  });
};

exports.getOneForEdit = async (req, res, next) => {
  const { id } = req.params;
  const countryId = req.countryId;
  let languageCode = req.languageCode;

  const vendorId = req.userId;
  let product,
    taxes,
    editData,
    similarProducts,
    units,
    allVariants,
    masterCategory,
    searchBrands,
    searchCategories,
    searchVendors,
    setting;

  try {
    // [product] = await Product.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //       vendor: new ObjectId(vendorId),
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         id: "$categoryId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$_id", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "categoryData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$productcategoriesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subproductcategories",
    //       let: {
    //         id: "$subCategoryId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$_id", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "subproductcategoriesData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$subproductcategoriesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       let: {
    //         id: "$brandId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$_id", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "brandsData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$brandsData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "units",
    //       let: {
    //         id: "$unitId",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$_id", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "unitData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$unitData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "warehouses",
    //       let: {
    //         ids: "$warehouses",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "warehousesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       let: {
    //         ids: "$countries",
    //         taxesIds: "$taxes.tax",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: "taxes",
    //             let: {
    //               taxIds: "$$taxesIds",
    //             },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $and: [
    //                     {
    //                       $expr: {
    //                         $in: ["$_id", "$$taxIds"],
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 $project: {
    //                   name: 1,
    //                   tax: 1,
    //                 },
    //               },
    //             ],
    //             as: "taxData",
    //           },
    //         },
    //       ],
    //       as: "countriesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productvariants",
    //       localField: "_id",
    //       foreignField: "mainProductId",
    //       as: "variantsData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       let: {
    //         ids: "$alternateProducts",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$ids"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "alternateProductsData",
    //     },
    //   },
    //   {
    //     $project: {
    //       masterCategoryId: 0,
    //       subCategoryId: 0,
    //       brandId: 0,
    //       unitId: 0,
    //       warehouses: 0,
    //       alternateProducts: 0,
    //       countries: 0,
    //       // variants: 0,
    //       isVendorActive: 0,
    //       views: 0,
    //       isSponsored: 0,
    //       isApproved: 0,
    //       isActive: 0,
    //       isDeleted: 0,
    //       createdAt: 0,
    //       updatedAt: 0,
    //       slug: 0,
    //       __v: 0,
    //       variantId: 0,
    //     },
    //   },
    // ]);

    product = VendorProduct.aggregate([
      {
        $match: {
          vendorId: new ObjectId(vendorId),
          // productId: new ObjectId(id),
          _id: new ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            id: "$productId",
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
          as: "productData",
        },
      },
      {
        $unwind: {
          path: "$productData",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$productData.categoryId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
                masterVariantId: 1,
              },
            },
          ],
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "brands",
          let: {
            id: "$productData.brandId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "brandData",
        },
      },
      {
        $lookup: {
          from: "units",
          let: {
            id: "$productData.unitId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "unitData",
        },
      },
      {
        $lookup: {
          from: "shippingcompanies",
          let: {
            id: "$productData.shippingCompany",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "shippingCompanyData",
        },
      },
      {
        $addFields: {
          alternateProducts: {
            $ifNull: ["$productData.alternateProducts", []],
          },
          media: {
            $ifNull: ["$productData.media", []],
          },
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            ids: "$productData.alternateProducts",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
                    },
                    isDeleted: false,
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "alternateProductsData",
        },
      },
      {
        $lookup: {
          from: "productvariants",
          let: {
            id: "$productId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainProductId", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                  // {
                  //   $expr: {
                  //     $eq: ["$isActive", true],
                  //   },
                  // },
                ],
              },
            },
            {
              $lookup: {
                from: "vendorproductvariants",
                let: {
                  productVariantId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$productVariantId", "$$productVariantId"],
                      },
                      vendorId: new ObjectId(vendorId),
                    },
                  },
                  {
                    $project: {
                      buyingPrice: 1,
                      buyingPriceCurrency: 1,
                      sellingPrice: 1,
                      discountedPrice: 1,
                      isActive: 1,
                    },
                  },
                ],
                as: "vendorData",
              },
            },
            {
              $unwind: {
                path: "$vendorData",
              },
            },
            {
              $project: {
                _id: "$vendorData._id",
                mainProductId: 1,
                firstVariantId: 1,
                firstVariantName: 1,
                firstSubVariantId: 1,
                firstSubVariantName: 1,
                secondVariantId: 1,
                secondVariantName: 1,
                secondSubVariantId: 1,
                secondSubVariantName: 1,
                buyingPrice: "$vendorData.buyingPrice",
                buyingPriceCurrency: "$vendorData.buyingPriceCurrency",
                sellingPrice: "$vendorData.sellingPrice",
                height: 1,
                weight: 1,
                width: 1,
                length: 1,
                media: 1,
                discountedPrice: "$vendorData.discountedPrice",
                dc: 1,
                shippingCompany: 1,
                barCode: 1,
                isActive: "$vendorData.isActive",
                customId: 1,
              },
            },
          ],
          as: "variantsData",
        },
      },
      {
        $lookup: {
          from: "productdescriptions",
          let: {
            id: "$productId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$productId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                ],
              },
            },
          ],
          as: "langData",
        },
      },
      {
        $project: {
          barCode: "$productData.barCode",
          hsCode: "$productData.hsCode",
          customId: "$productData.customId",
          categoryId: "$productData.categoryId",
          brand: {
            $arrayElemAt: ["$brandData", 0],
          },
          unit: {
            $arrayElemAt: ["$unitData", 0],
          },
          categoryData: {
            $arrayElemAt: ["$categoryData", 0],
          },
          isPublished: "$productData.isPublished",
          buyingPrice: 1,
          // buyingPriceCurrency: "$productData.buyingPriceCurrency",
          buyingPriceCurrency: 1,
          sellingPrice: 1,
          langData: {
            $arrayElemAt: ["$langData", 0],
          },
          height: "$productData.height",
          weight: "$productData.weight",
          width: "$productData.width",
          length: "$productData.length",
          dc: "$productData.dc",
          // shippingCompany: "$productData.shippingCompany",
          alternateProducts: "$alternateProductsData",
          variantsData: 1,
          media: 1,
          variants: "$productData.variants",
          coverImage: "$productData.coverImage",
          discountedPrice: 1,
          shippingCompany: {
            $arrayElemAt: ["$shippingCompanyData", 0],
          },
        },
      },
    ]);

    // taxes = Vendor.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(vendorId),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         countries: "$serveCountries",
    //       },
    //       pipeline: [
    //         {
    //           $unwind: {
    //             path: "$country",
    //           },
    //         },
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: [
    //                     "$_id",
    //                     new ObjectId(product?.productcategoriesData?._id),
    //                   ],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $in: ["$country", "$$countries"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: "countries",
    //             let: {
    //               countryId: "$country",
    //             },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $and: [
    //                     {
    //                       $expr: {
    //                         $eq: ["$_id", "$$countryId"],
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 $lookup: {
    //                   from: "taxes",
    //                   pipeline: [
    //                     {
    //                       $match: {
    //                         $and: [
    //                           {
    //                             $expr: {
    //                               $eq: ["$countryId", "$$countryId"],
    //                             },
    //                           },
    //                           {
    //                             $expr: {
    //                               $eq: ["$isDeleted", false],
    //                             },
    //                           },
    //                         ],
    //                       },
    //                     },
    //                     {
    //                       $addFields: {
    //                         isSelected: {
    //                           $in: [
    //                             "$_id",
    //                             product?.taxes?.map((t) => ObjectId(t.tax)),
    //                           ],
    //                         },
    //                       },
    //                     },
    //                     {
    //                       $project: {
    //                         isSelected: 1,
    //                         name: 1,
    //                         tax: 1,
    //                       },
    //                     },
    //                   ],
    //                   as: "taxData",
    //                 },
    //               },
    //               {
    //                 $project: {
    //                   name: 1,
    //                   taxData: 1,
    //                 },
    //               },
    //             ],
    //             as: "countryData",
    //           },
    //         },
    //         {
    //           $unwind: {
    //             path: "$countryData",
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: "$_id",
    //             name: {
    //               $first: "$name",
    //             },
    //             countries: {
    //               $push: "$countryData",
    //             },
    //           },
    //         },
    //       ],
    //       as: "result",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$result",
    //     },
    //   },
    //   {
    //     $project: {
    //       countries: "$result.countries",
    //     },
    //   },
    // ]);

    // editData = Vendor.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       _id: new ObjectId(vendorId),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         productCategories: "$productCategories",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$productCategories"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: "subproductcategories",
    //             let: {
    //               id: "$_id",
    //             },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $and: [
    //                     {
    //                       $expr: {
    //                         $eq: ["$productCategoryId", "$$id"],
    //                       },
    //                     },
    //                     {
    //                       $expr: {
    //                         $eq: ["$isActive", true],
    //                       },
    //                     },
    //                     {
    //                       $expr: {
    //                         $eq: ["$isDeleted", false],
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 $project: {
    //                   name: 1,
    //                   masterVariant: 1,
    //                 },
    //               },
    //             ],
    //             as: "subCategories",
    //           },
    //         },
    //       ],
    //       as: "mainCategories",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "warehouses",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$vendor", "$$id"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 0,
    //             label: "$name",
    //             value: "$_id",
    //           },
    //         },
    //       ],
    //       as: "warehouses",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subproductcategories",
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $eq: [
    //                 "$_id",
    //                 new ObjectId(product?.subproductcategoriesData._id),
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             brands: 1,
    //           },
    //         },
    //       ],
    //       as: "subproductCategoriesData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$subproductCategoriesData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       let: {
    //         brandsIds: "$subproductCategoriesData.brands",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$brandsIds"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isActive", true],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             name: 1,
    //           },
    //         },
    //       ],
    //       as: "brandsData",
    //     },
    //   },
    //   {
    //     $project: {
    //       mainCategories: 1,
    //       warehouses: 1,
    //       businessName: 1,
    //       brandsData: 1,
    //     },
    //   },
    // ]);

    // units = Unit.find({ isDeleted: false }).select("_id name").lean();

    similarProducts = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          // isPublished: true,
          // isApproved: true,
          // isVendorActive: true,
          // isHelper: false,
          countries: {
            $in: [new ObjectId(countryId)],
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "masterCategoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorData",
        },
      },
      {
        $unwind: {
          path: "$brandData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
        },
      },
      {
        $unwind: {
          path: "$vendorData",
        },
      },
      {
        $project: {
          customId: 1,
          brandId: 1,
          name: 1,
          brandName: "$brandData.name",
          categoryId: "$categoryData._id",
          categoryName: "$categoryData.name",
          vendor: 1,
          vendorName: "$vendorData.businessName",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 9,
      },
    ]);

    // variants = await Variant.aggregate([
    //   {
    //     $match: {
    //       isActive: true,
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subvariants",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$variantId", "$$id"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //             ],
    //             $or: [
    //               {
    //                 $expr: {
    //                   $eq: ["$vendorId", new ObjectId(vendorId)],
    //                 },
    //               },
    //               {
    //                 vendorId: {
    //                   $exists: false,
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             name: 1,
    //             categoriesId: 1,
    //           },
    //         },
    //       ],
    //       as: "variants",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$variants",
    //     },
    //   },
    //   {
    //     $match: {
    //       "variants.categoriesId": {
    //         $in: [new ObjectId(product?.subproductcategoriesData._id)],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       subVariant: {
    //         id: "$variants._id",
    //         name: "$variants.name",
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       name: {
    //         $first: "$name",
    //       },
    //       subVariants: {
    //         $push: "$subVariant",
    //       },
    //     },
    //   },
    // ]);

    // masterCategory = SubProductCategory.findById(
    //   product?.subproductcategoriesData._id
    // )
    //   .select("masterVariant")
    //   .lean();

    // searchBrands = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //       _id: {
    //         $nin: [new ObjectId(id)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       localField: "brandId",
    //       foreignField: "_id",
    //       as: "brandData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$brandData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$brandData._id",
    //       name: {
    //         $first: "$brandData.name",
    //       },
    //     },
    //   },
    // ]);

    // searchCategories = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //       _id: {
    //         $nin: [new ObjectId(id)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       localField: "masterCategoryId",
    //       foreignField: "_id",
    //       as: "categoryData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$categoryData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$categoryData._id",
    //       name: {
    //         $first: "$categoryData.name",
    //       },
    //     },
    //   },
    // ]);

    // searchVendors = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       // isApproved: true,
    //       // isVendorActive: true,
    //       // isHelper: false,
    //       countries: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //       _id: {
    //         $nin: [new ObjectId(id)],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "vendors",
    //       localField: "vendor",
    //       foreignField: "_id",
    //       as: "vendorData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$vendorData",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$vendorData._id",
    //       name: {
    //         $first: "$vendorData.businessName",
    //       },
    //     },
    //   },
    // ]);

    // setting = Setting.findOne({ key: "Product.files" });

    allVariants = Variant.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "subvariants",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$variantId", "$$id"],
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
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: "variants",
        },
      },
      {
        $unwind: {
          path: "$variants",
        },
      },
      {
        $project: {
          name: 1,
          subVariant: {
            id: "$variants._id",
            name: "$variants.name",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
          subVariants: {
            $push: "$subVariant",
          },
        },
      },
    ]);

    [
      // [taxes],
      // [editData],
      // units,
      similarProducts,
      allVariants,
      // masterCategory,
      // searchBrands,
      // searchCategories,
      // searchVendors,
      // setting,
      [product],
    ] = await Promise.all([
      // taxes,
      // editData,
      // units,
      similarProducts,
      allVariants,
      // masterCategory,
      // searchBrands,
      // searchCategories,
      // searchVendors,
      // setting,
      product,
    ]);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fatched product.",
      500
    );
    return next(error);
  }

  // if (masterCategory) {
  //   let masterVariant = masterCategory.masterVariant;

  //   variants = variants.map((v) => {
  //     if (v._id.toString() == masterVariant.toString()) {
  //       v.isMasterVariant = true;
  //     } else {
  //       v.isMasterVariant = false;
  //     }
  //     return v;
  //   });
  // }

  res.status(200).json({
    status: true,
    message: "Product data fetched successfully.",
    product,
    // taxes: taxes?.countries ?? [],
    // editData,
    // units,
    similarProducts,
    allVariants,
    // searchBrands,
    // searchCategories,
    // searchVendors,
    // maximumImagesCount: +setting.value,
  });
};

exports.getAlternateProducts = async (req, res, next) => {
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  const { name, category, brand, vendor, productId } = req.query;

  const searchObj = {};

  if (name) {
    searchObj.name = new RegExp(name, "i");
  }

  if (category && new ObjectId.isValid(category)) {
    searchObj.masterCategoryId = new ObjectId(category);
  }

  if (brand && new ObjectId.isValid(brand)) {
    searchObj.brandId = new ObjectId(brand);
  }

  // if (vendor && ObjectId.isValid(vendor)) {
  //   searchObj.vendor = new ObjectId(vendor);
  // }

  if (productId && new ObjectId.isValid(productId)) {
    searchObj._id = {
      $nin: [new ObjectId(productId)],
    };
  }

  let similarProducts;

  try {
    similarProducts = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          // isPublished: true,
          // isApproved: true,
          // isVendorActive: true,
          // isHelper: false,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
        },
      },
      {
        $match: {
          ...searchObj,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      // {
      //   $lookup: {
      //     from: "vendors",
      //     localField: "vendor",
      //     foreignField: "_id",
      //     as: "vendorData",
      //   },
      // },
      {
        $unwind: {
          path: "$brandData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
        },
      },
      // {
      //   $unwind: {
      //     path: "$vendorData",
      //   },
      // },
      {
        $project: {
          customId: 1,
          brandId: 1,
          name: 1,
          brandName: "$brandData.name",
          categoryId: "$categoryData._id",
          categoryName: "$categoryData.name",
          // vendor: 1,
          // vendorName: "$vendorData.businessName",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 9,
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
    status: true,
    message: "Data fetched successfully",
    similarProducts,
  });
};

//updated
exports.topSellingItems = async (req, res, next) => {
  let userId = req.userId;
  let countryId = req.countryId;
  let languageCode = req.languageCode;

  const wishlistObj = {
    first: [],
    second: {},
  };

  if (userId) {
    wishlistObj.first = [
      {
        $lookup: {
          from: "wishlists",
          let: {
            id: "$idForCart",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$$id", "$itemId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$itemType", "product"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$customerId", new ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          ],
          as: "wishlistData",
        },
      },
    ];

    wishlistObj.second = {
      isWishlisted: {
        $cond: [
          {
            $size: "$wishlistData",
          },
          true,
          false,
        ],
      },
    };
  }

  const COMMON_OLD = [
    {
      $match: {
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
        coverImage: {
          $ne: null,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    // added new end
    {
      $lookup: {
        from: "productvariants",
        let: {
          id: "$_id",
          vendorId: "$vendorData.vendorId",
        },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $eq: ["$mainProductId", "$$id"],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isDeleted", false],
                  },
                },
                {
                  $expr: {
                    $eq: ["$isActive", true],
                  },
                },
              ],
            },
          },
          {
            $limit: 1,
          },
          {
            $lookup: {
              from: "productvariantdescriptions",
              let: {
                id: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$id"],
                    },
                    languageCode: languageCode,
                  },
                },
              ],
              as: "descData",
            },
          },
          {
            $unwind: {
              path: "$descData",
            },
          },
          // added new start
          {
            $lookup: {
              from: "vendorproductvariants",
              let: {
                productVariantId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$productVariantId", "$$productVariantId"],
                    },
                    isDeleted: false,
                    isActive: true,
                    $and: [
                      {
                        $expr: {
                          $eq: ["$vendorId", "$$vendorId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $sort: {
                    createdAt: 1,
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          //added new end
        ],
        as: "variantData",
      },
    },
    {
      $unwind: {
        path: "$variantData",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...COMMON_AGG,
    {
      $lookup: {
        from: "productdescriptions",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              languageCode: languageCode,
            },
          },
        ],
        as: "descData",
      },
    },
    {
      $unwind: {
        path: "$descData",
      },
    },
    {
      $addFields: {
        slug: {
          $ifNull: ["$variantData.descData.slug", "$descData.slug"],
        },
        vendor: {
          $ifNull: ["$variantData.vendorData.vendorId", "$vendorData.vendorId"],
        },
        sellingPrice: {
          $ifNull: [
            "$variantData.vendorData.sellingPrice",
            "$vendorData.sellingPrice",
          ],
        },
        discountedPrice: {
          $ifNull: [
            "$variantData.vendorData.discountedPrice",
            "$vendorData.discountedPrice",
          ],
        },
        buyingPriceCurrency: {
          $ifNull: [
            "$variantData.vendorData.buyingPriceCurrency",
            "$vendorData.buyingPriceCurrency",
          ],
        },
        idForCart: {
          $ifNull: ["$variantData.vendorData._id", "$vendorData._id"],
        },
        typeForCart: {
          $cond: ["$variantData.vendorData._id", "variant", "main"],
        },
      },
    },
    {
      $addFields: {
        ratings: 0,
        // discountPercentage: 0,
        reviewsCount: 0,
        media: "$coverImage",
        // pricesFiltered: {
        //   $filter: {
        //     input: "$prices",
        //     cond: {
        //       $eq: ["$$item.countryId", new ObjectId(countryId)],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
        // media: {
        //   $filter: {
        //     input: "$media",
        //     cond: {
        //       $eq: ["$$item.isFeatured", true],
        //     },
        //     as: "item",
        //     limit: 1,
        //   },
        // },
      },
    },
    // {
    //   $unwind: {
    //     path: "$pricesFiltered",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$media",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $addFields: {
    //     price: "$pricesFiltered.sellingPrice",
    //     discountedPrice: "$pricesFiltered.discountPrice",
    //     discountPercentage: {
    //       $round: [
    //         {
    //           $subtract: [
    //             100,
    //             {
    //               $divide: [
    //                 {
    //                   $multiply: ["$pricesFiltered.discountPrice", 100],
    //                 },
    //                 "$pricesFiltered.sellingPrice",
    //               ],
    //             },
    //           ],
    //         },
    //         2,
    //       ],
    //     },
    //   },
    // },
  ];

  const COMMON = [
    {
      $match: {
        itemType: "product",
        isDeleted: false,
        isActive: true,
        isPublished: true,
        isApproved: true,
      },
    },
    {
      $match: {
        coverImage: {
          $ne: null,
        },
      },
    },
    {
      $limit: 10,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $addFields: {
        uniqueId: {
          $concat: [
            {
              $toString: "$itemId",
            },
            "_",
            {
              $toString: "$vendorId",
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$uniqueId",
        ids: {
          $push: "$_id",
        },
        itemId: {
          $first: "$itemId",
        },
        itemSubType: {
          $first: "$itemSubType",
        },
        vendorId: {
          $first: "$vendorId",
        },
      },
    },
    {
      $addFields: {
        ids: {
          $size: "$ids",
        },
      },
    },
    {
      $lookup: {
        from: "vendors",
        let: {
          id: "$vendorId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$_id"],
              },
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: "vendorData",
      },
    },
    {
      $unwind: {
        path: "$vendorData",
      },
    },
    {
      $sort: {
        ids: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["main", "$$itemSubType"],
                  },
                },
              ],
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$productId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isDeleted: false,
                    isActive: true,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                    brandId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$productId",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    slug: 1,
                    shortDescription: 1,
                  },
                },
              ],
              as: "langData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendor: "$vendorId",
              sellingPrice: 1,
              discountedPrice: 1,
              buyingPriceCurrency: 1,
              idForCart: "$$id",
              typeForCart: "main",
              categoryId: "$productData.categoryId",
              shortDescription: "$langData.shortDescription",
            },
          },
        ],
        as: "vendorProduct",
      },
    },
    {
      $lookup: {
        from: "vendorproductvariants",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["variant", "$$itemSubType"],
                  },
                },
              ],
              isDeleted: false,
              isActive: true,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$mainProductId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isDeleted: false,
                    isActive: true,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                    brandId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$productData._id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productId", "$$id"],
                        },
                        languageCode: languageCode,
                      },
                    ],
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    slug: 1,
                    shortDescription: 1,
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
            $lookup: {
              from: "productvariants",
              let: {
                id: "$mainProductId",
                productVariantId: "$productVariantId",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$mainProductId", "$$id"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$_id", "$$productVariantId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isDeleted", false],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isActive", true],
                        },
                      },
                    ],
                  },
                },
                {
                  $lookup: {
                    from: "productvariantdescriptions",
                    let: {
                      productVariantId: "$_id",
                    },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $eq: [
                                  "$productVariantId",
                                  "$$productVariantId",
                                ],
                              },
                              languageCode: languageCode,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          name: 1,
                          slug: 1,
                          shortDescription: 1,
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
              ],
              as: "variantData",
            },
          },
          {
            $unwind: {
              path: "$variantData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              vendor: "$vendorId",
              media: "$productData.coverImage",
              name: "$langData.name",
              shortDescription: "$langData.shortDescription",
              firstVariantName: "$variantData.firstVariantName",
              secondVariantName: "$variantData.secondVariantName",
              firstSubVariantName: "$variantData.firstSubVariantName",
              secondSubVariantName: "$variantData.secondSubVariantName",
              slug: "$variantData.langData.slug",
              name: "$variantData.langData.name",
              brandName: "$brandData.name",
              typeForCart: "variant",
              sellingPrice: 1,
              discountedPrice: 1,
              buyingPriceCurrency: 1,
              idForCart: "$$id",
              categoryId: "$productData.categoryId",
            },
          },
        ],
        as: "vendorProductVariant",
      },
    },
    {
      $addFields: {
        product: {
          $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
        },
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$product",
      },
    },
  ];

  let products, currencyData, currentCurrency, usdCurrency;

  try {
    // [currencyData] = await Currency.aggregate([
    //   {
    //     $match: {
    //       countriesId: {
    //         $in: [new ObjectId(countryId)],
    //       },
    //     },
    //   },
    //   {
    //     $limit: 1,
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sign: 1,
    //     },
    //   },
    // ]);

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    if (!currenciesData.status) {
      return res.status(200).json({
        status: false,
        message: "Invalid Country.",
        products: [],
        totalProducts: 0,
      });
    }

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    // products = await Product.aggregate([
    products = await OrderItem.aggregate([
      ...COMMON,
      // { $sample: { size: 5 } },
      ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
      ...wishlistObj.first,
      ...REVIEW_AGG.first,
      // {
      //   $project: {
      //     name: "$descData.name",
      //     ratings: 1,
      //     reviewsCount: 1,
      //     shortDescription: "$descData.shortDescription",
      //     media: 1,
      //     price: 1,
      //     discountedPrice: 1,
      //     discountPercentage: 1,
      //     // currency: { $literal: "$" },
      //     currency: { $literal: currentCurrency.sign },
      //     slug: 1,
      //     isWishlisted: {
      //       $toBool: false,
      //     },
      //     ...wishlistObj.second,
      //     isBestSeller: {
      //       $toBool: true,
      //     },
      //     vendor: 1,
      //     idForCart: 1,
      //     typeForCart: 1,
      //     ...REVIEW_AGG.second,
      //   },
      // },
      {
        $project: {
          slug: 1,
          vendor: 1,
          // sellingPrice: 1,
          discountedPrice: 1,
          // buyingPriceCurrency: 1,
          idForCart: 1,
          typeForCart: 1,
          media: 1,
          // categoryId: 1,
          name: 1,
          ratings: 1,
          reviewsCount: 1,
          shortDescription: 1,

          price: 1,
          discountPercentage: 1,
          currency: { $literal: currentCurrency.sign },
          isWishlisted: {
            $toBool: false,
          },
          ...wishlistObj.second,
          isBestSeller: {
            $toBool: true,
          },
          ...REVIEW_AGG.second,
        },
      },
    ]);
  } catch (err) {
    console.log("Err", err);
    return res.status(200).json({
      status: false,
      message: "Could not fetch products",
      products: [],
      currency: "$",
    });
  }

  res.status(200).json({
    status: true,
    message: "Products fetched successfully",
    products,
    currency: currencyData?.sign,
  });
};

exports.getHelperProducts = async (req, res, next) => {
  let helperProducts;

  const { name, masterCategoryId, subCategoryId, brandId } = req.body;

  if (!name || !masterCategoryId || !subCategoryId || !brandId) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide all necessary products",
      500
    );
    return next(error);
  }

  try {
    helperProducts = await Product.aggregate([
      {
        $match: {
          isHelper: true,
          name: new RegExp(name, "i"),
          masterCategoryId: new ObjectId(masterCategoryId),
          subCategoryId: new ObjectId(subCategoryId),
          brandId: new ObjectId(brandId),
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $project: {
          name: 1,
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
    status: true,
    message: "Products fetched successfully",
    products: helperProducts,
  });
};

exports.update = async (req, res, next) => {
  const vendor = req.userId;

  let {
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    discountedPrice,
    id,
    subVariants,
  } = req.body;

  subVariants = JSON.parse(subVariants);

  const Promises = [];

  try {
    Promises.push(
      VendorProduct.findOneAndUpdate(
        {
          vendorId: new ObjectId(vendor),
          // productId: new ObjectId(id),
          _id: new ObjectId(id),
        },
        {
          $set: {
            buyingPrice,
            sellingPrice,
            buyingPriceCurrency,
            discountedPrice,
          },
        }
      )
    );

    subVariants.forEach((sv) => {
      Promises.push(
        VendorProductVariant.findOneAndUpdate(
          {
            vendorId: new ObjectId(vendor),
            // productVariantId: new ObjectId(sv.id),
            _id: new ObjectId(sv.id),
          },
          {
            $set: {
              buyingPrice: sv.buyingPrice,
              sellingPrice: sv.sellingPrice,
              buyingPriceCurrency: sv.buyingPriceCurrency,
              discountedPrice: sv.discountedPrice,
              isActive: sv.isActive,
            },
          }
        )
      );
    });

    await Promise.all(Promises);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update product.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Product updated successfully",
  });
};

exports.oldupdate = async (req, res, next) => {
  let {
    name,
    masterCategoryId,
    subCategoryId,
    brandId,
    warehouses,
    quantity,
    buyingPrice,
    serialNumber,
    featureTitle,
    prices,
    shortDescription,
    longDescription,
    taxesData,
    features,
    faqs,
    isPublished,
    inStock,
    unitId,
    featuredMediaId,
    metaData,
    countries,
    mediaIds,
    height,
    weight,
    width,
    length,
    variants,
    subVariants,
    alternateProductIds,
    id,
  } = req.body;

  //req.userId

  warehouses = JSON.parse(warehouses);
  features = JSON.parse(features);
  metaData = JSON.parse(metaData);
  mediaIds = JSON.parse(mediaIds);
  variants = JSON.parse(variants);
  subVariants = JSON.parse(subVariants);
  faqs = JSON.parse(faqs);

  prices = JSON.parse(prices);
  // descriptionLangData = JSON.parse(descriptionLangData);
  taxesData = JSON.parse(taxesData);
  // featuresLang = JSON.parse(featuresLang);
  countries = JSON.parse(countries);
  alternateProductIds = JSON.parse(alternateProductIds);
  // faqsLang = JSON.parse(faqsLang);

  const extras = {};

  if (req.files.ogImage) {
    metaData.ogImage = req.files.ogImage[0].path;
  }

  const allMedia = [];

  if (req.files.media) {
    req.files.media.forEach((m, idx) => {
      allMedia.push({ src: m.path, isImage: !VIDEO.includes(m.mimetype) });
    });
  }

  const mediaHandler = (idx) => {
    const media = [];
    //work on it please
    mediaIds[idx]?.forEach((m) => {
      media.push(allMedia[m]);
    });
    return media;
  };

  try {
    const oldProductData = await Product.findById(id)
      .select("media variants")
      .lean();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          masterCategoryId,
          subCategoryId,
          brandId,
          unitId,
          warehouses,
          buyingPrice,
          prices,
          taxes: taxesData,
          quantity,
          serialNumber,
          featureTitle,
          features,
          faqs,
          shortDescription,
          longDescription,
          height,
          weight,
          width,
          length,
          alternateProducts: alternateProductIds,
          metaData,
          countries,
          variants,
          isPublished,
          inStock,
          media: mediaIds["main"].map((m, idx) => {
            return {
              ...allMedia[m],
              isFeatured: idx === +featuredMediaId,
            };
          }),
        },
      },
      { new: true }
    );

    let variantId = updatedProduct.variantId;

    const subVariantsPromise = [];

    let addedVariants = await ProductVariant.find({
      mainProductId: new ObjectId(id),
      isDeleted: false,
    }).lean();

    subVariants.forEach((sv, idx) => {
      let isExist;

      if (oldProductData.variants.length === variants.length) {
        if (variants.length === 2) {
          isExist = addedVariants.find(
            (av) =>
              av.firstVariantId.toString() == sv.firstVariantId.toString() &&
              av.secondVariantId.toString() == sv.secondVariantId.toString() &&
              av.firstSubVariantId.toString() ==
                sv.firstSubVariantId.toString() &&
              av.secondSubVariantId.toString() ==
                sv.secondSubVariantId.toString()
          );
        } else {
          isExist = addedVariants.find(
            (av) =>
              av.firstVariantId.toString() == sv.firstVariantId.toString() &&
              av.firstSubVariantId.toString() == sv.firstSubVariantId.toString()
          );
        }
      }

      if (isExist) {
        addedVariants = addedVariants.filter(
          (av) => av._id.toString() != isExist._id.toString()
        );

        subVariantsPromise.push(
          ProductVariant.findByIdAndUpdate(isExist._id, {
            $set: {
              ...sv,
              name,
              media: mediaHandler(idx),
            },
          })
        );
      } else {
        let newData = new ProductVariant({
          ...sv,
          mainProductId: updatedProduct._id,
          media: mediaHandler(idx),
          name,
          slug: `${updatedProduct.slug}-${++variantId}`,
        });

        subVariantsPromise.push(newData.save());
      }
    });

    if (updatedProduct.variantId !== variantId) {
      updatedProduct.variantId = variantId;

      subVariantsPromise.push(updatedProduct.save());
    }

    if (addedVariants.length > 0) {
      subVariantsPromise.push(
        ProductVariant.updateMany(
          {
            _id: {
              $in: addedVariants.map((a) => a._id),
            },
          },
          {
            $set: {
              isDeleted: true,
            },
          }
        )
      );
    }

    await Promise.all(subVariantsPromise);

    if (oldProductData.media.length > 0) {
      oldProductData.media.forEach((media) => {
        fs.unlink(media.src, (err) => {
          // if (err) {
          //   console.log(err);
          // } else {
          //   console.log(`Deleted - ${media.src}`);
          // }
        });
      });
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not update product.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product Updated Successfully",
  });
};

exports.getHelperProduct = async (req, res, next) => {
  const { id } = req.params;

  let product;

  try {
    [product] = await Product.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          isHelper: true,
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "units",
          let: {
            id: "$unitId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "unitData",
        },
      },
      {
        $lookup: {
          from: "productvariants",
          let: {
            mainProductId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainProductId", "$$mainProductId"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                  // {
                  //   $expr: {
                  //     $eq: ["$isActive", true],
                  //   },
                  // },
                ],
              },
            },
            {
              $project: {
                firstVariantId: 1,
                secondVariantId: 1,
                firstVariantName: 1,
                secondVariantName: 1,
                firstSubVariantId: 1,
                secondSubVariantId: 1,
                firstSubVariantName: 1,
                secondSubVariantName: 1,
                quantity: 1,
                height: 1,
                weight: 1,
                width: 1,
                length: 1,
                media: 1,
              },
            },
          ],
          as: "variantsData",
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            ids: "$alternateProducts",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$ids"],
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
              $project: {
                name: 1,
              },
            },
          ],
          as: "alternateProductsData",
        },
      },
      {
        $project: {
          media: 1,
          serialNumber: 1,
          unit: {
            $arrayElemAt: ["$unitData", 0],
          },
          shortDescription: 1,
          longDescription: 1,
          featureTitle: 1,
          features: 1,
          height: 1,
          weight: 1,
          width: 1,
          length: 1,
          alternateProductsData: 1,
          faqs: 1,
          metaData: 1,
          variantsData: 1,
          variants: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product fetched successfully",
    product,
  });
};

exports.importFile = async (req, res, next) => {
  const { fileLink, container } = req.body;

  const fileName = `${
    new Date().toISOString().replace(/:/g, "-") + "-"
  }-file.xml`;

  const directoryPath = path.resolve(
    __dirname,
    "..",
    "..",
    "uploads",
    "images",
    "product-files",
    fileName
  );

  let localFile = fs.createWriteStream(directoryPath);

  let url;

  try {
    url = new URL(fileLink);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid url provided.",
      500
    );
    return next(error);
  }

  let client = http;

  client = url.protocol == "https:" ? https : client;

  // console.log("url", url);

  const request = client.get(fileLink, function (response) {
    response.on("end", function () {
      fs.readFile(directoryPath, async function (err, data) {
        if (err) {
          const error = new HttpError(
            req,
            new Error().stack.split("at ")[1].trim(),
            "Something went wrong.",
            500
          );
          return next(error);
        }

        let json;

        try {
          json = parser.toJson(data);
        } catch (err) {
          const error = new HttpError(
            req,
            new Error().stack.split("at ")[1].trim(),
            err,
            500
          );
          return next(error);
        }

        json = JSON.parse(json);

        const resultObj = findKeyPath(json, "", container);
        const result = resultObj?.data;

        if (!result || !Array.isArray(result)) {
          const error = new HttpError(
            req,
            new Error().stack.split("at ")[1].trim(),
            !json
              ? "Please provide valid link."
              : "Invalid container provided.",
            500
          );
          return next(error);
        }

        res.status(200).json({
          status: true,
          product: result[0],
          fileName,
          containers: resultObj.string.split(","),
          // result,
        });
      });
    });

    response.pipe(localFile);
  });
};

exports.importCategories = async (req, res, next) => {
  const { categoryId } = req.body;
  let languageCode = req.languageCode;
  const vendorId = req.userId;

  let { key, value } = req.query;

  //key = barcode, name

  const matchObj = {};

  if (key && ["barcode", "name"].includes(key)) {
    matchObj[key == "barcode" ? "barCode" : "name"] = new RegExp(value, "i");
  }

  let categoriesId, importedProducts, products;

  try {
    categoriesId = ProductCategory.aggregate([
      {
        $match: {
          _id: new ObjectId(categoryId),
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
          ],
          as: "first",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            ids: "$first._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$parentId", "$$ids"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "second",
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            ids: "$second._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$parentId", "$$ids"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "third",
        },
      },
      {
        $project: {
          id: ["$_id"],
          first: 1,
          second: 1,
          third: 1,
        },
      },
      {
        $project: {
          ids: {
            $concatArrays: [
              {
                $map: {
                  input: "$first",
                  as: "a",
                  in: "$$a._id",
                },
              },
              {
                $map: {
                  input: "$second",
                  as: "a",
                  in: "$$a._id",
                },
              },
              {
                $map: {
                  input: "$third",
                  as: "b",
                  in: "$$b._id",
                },
              },
              "$id",
            ],
          },
        },
      },
    ]);

    importedProducts = VendorProduct.find({
      vendorId: new ObjectId(vendorId),
      isDeleted: false,
    })
      .select("productId")
      .lean();

    [[categoriesId], importedProducts] = await Promise.all([
      categoriesId,
      importedProducts,
    ]);

    products = await Product.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
          categoryId: {
            $in: categoriesId.ids.map((id) => new ObjectId(id)),
          },
          _id: {
            $nin: importedProducts.map((p) => new ObjectId(p.productId)),
          },
          isApproved: true,
          isPublished: true,
        },
      },
      {
        $lookup: {
          from: "productdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$id"],
                },
                languageCode: languageCode,
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
          media: "$coverImage",
          barCode: 1,
        },
      },
      {
        $match: matchObj,
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
    status: true,
    message: "Products fetched successfully.",
    products,
  });
};

exports.importProducts = async (req, res, next) => {
  const { ids } = req.body;
  const vendorId = req.userId;

  let products;

  try {
    // products = await Product.find({
    //   _id: {
    //     $in: ids.map((i) => new ObjectId(i)),
    //   },
    //   isDeleted: false,
    //   isActive: true,
    // })
    //   .select("_id")
    //   .lean();

    products = await Product.aggregate([
      {
        $match: {
          _id: {
            $in: ids.map((i) => new ObjectId(i)),
          },
        },
      },
      {
        $lookup: {
          from: "productvariants",
          let: {
            mainProductId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$mainProductId", "$$mainProductId"],
                },
                isDeleted: false,
              },
            },
            {
              $project: {
                mainProductId: 1,
                buyingPriceCurrency: 1,
              },
            },
          ],
          as: "productVariants",
        },
      },
      {
        $project: {
          buyingPriceCurrency: 1,
          productVariants: 1,
        },
      },
    ]);

    const promises = [];

    if (products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const vp = new VendorProduct({
          vendorId,
          productId: product._id,
          buyingPrice: 0,
          sellingPrice: 0,
          discountedPrice: 0,
          buyingPriceCurrency: product.buyingPriceCurrency,
          isActive: false,
        });

        promises.push(vp.save());

        if (product.productVariants.length > 0) {
          promises.push(
            VendorProductVariant.insertMany(
              product.productVariants.map((p) => ({
                vendorId,
                mainProductId: product._id,
                productVariantId: p._id,
                buyingPrice: 0,
                sellingPrice: 0,
                discountedPrice: 0,
                buyingPriceCurrency: p.buyingPriceCurrency,
              }))
            )
          );
        }
      }
    }

    await Promise.all(promises);
  } catch (err) {
    console.log("err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Products imported successfully.",
  });
};

exports.featuresData = async (req, res, next) => {
  const id = req.params.id;

  let options;

  try {
    options = await SubSpecificationGroupValue.aggregate([
      {
        $match: {
          subSpecificationId: new ObjectId(id),
          name: new RegExp(req.query.term, "i"),
          isDeleted: false,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $limit: 10,
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
      "Could not fetch features",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Features fetched successfully.",
    options,
  });
};
