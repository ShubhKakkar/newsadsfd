const ObjectId = require("mongoose").Types.ObjectId;

const Variant = require("../models/variant");
const SubVariant = require("../models/subVariant");
const MasterDescription = require("../models/masterDescription");
const HttpError = require("../http-error");

const Product = require("../models/product");
const ProductVariant = require("../models/productVariant");

exports.create = async (req, res, next) => {
  let { mainData, subData } = req.body;

  const newVariant = new Variant({ name: mainData.name });

  const variantSubData = subData.map((data) => ({
    languageCode: data.languageCode,
    name: data.name,
    mainPage: newVariant._id,
    key: "variant",
  }));

  const subVariantsPromise = [];

  for (let i = 0; i < mainData.variants.length; i++) {
    const newSubVariant = new SubVariant({
      ...mainData.variants[i],
      variantId: newVariant._id,
    });
    // subVariantsPromise.push(newSubVariant.save());
    await newSubVariant.save();

    subVariantsPromise.concat(
      MasterDescription.insertMany(
        subData.map((data) => ({
          languageCode: data.languageCode,
          name: data.variants[i].name,
          mainPage: newSubVariant._id,
          key: "subVariant",
        }))
      )
    );
  }

  try {
    await newVariant.save();
    await MasterDescription.insertMany(variantSubData);
    await Promise.all(subVariantsPromise);
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
    message: "Variant created successfully",
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

  let variants, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = await Variant.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      variants = await Variant.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      variants = await Variant.find({
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
      "Could not fetch variants.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Variants Fetched successfully.",
    variants,
    totalDocuments,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  const promises = [];

  try {
    promises.push(
      Variant.findByIdAndUpdate(id, {
        $set: {
          isDeleted: true,
        },
      })
    );

    promises.push(
      SubVariant.updateMany(
        { variantId: ObjectId(id) },
        {
          $set: {
            isDeleted: true,
          },
        }
      )
    );

    // promises.push(
    //   MasterDescription.deleteMany({ mainPage: ObjectId(id), key: "variant" })
    // );

    await Promise.all(promises);
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
    message: "Variant deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let variant, variantSubData;

  try {
    variant = Variant.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          isDeleted: false,
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
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$key", "variant"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                id: "$_id",
                languageCode: "$languageCode",
                name: "$name",
              },
            },
          ],
          as: "languageData",
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
                  {
                    vendorId: {
                      $exists: false,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: "$name",
                categoriesId: "$categoriesId",
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
                      $and: [
                        {
                          $expr: {
                            $eq: ["$mainPage", "$$id"],
                          },
                        },
                        {
                          $expr: {
                            $eq: ["$key", "subVariant"],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      id: "$_id",
                      languageCode: "$languageCode",
                      name: "$name",
                    },
                  },
                ],
                as: "languageData",
              },
            },
          ],
          as: "subVariants",
        },
      },
      {
        $project: {
          data: {
            id: "$_id",
          },
          languageData: 1,
          subVariants: 1,
        },
      },
    ]);

    variantSubData = Variant.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
                  {
                    vendorId: {
                      $exists: false,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                categoriesId: "$categoriesId",
              },
            },
          ],
          as: "subVariants",
        },
      },
      {
        $unwind: {
          path: "$subVariants",
        },
      },
      {
        $lookup: {
          from: "subproductcategories",
          let: {
            subCategories: "$subVariants.categoriesId",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$subCategories"],
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                value: "$_id",
                label: "$name",
              },
            },
          ],
          as: "subVariants.categoriesId",
        },
      },
      {
        $group: {
          _id: "$_id",
          subVariants: {
            $push: "$subVariants",
          },
        },
      },
    ]);

    [[variant], [variantSubData]] = await Promise.all([
      variant,
      variantSubData,
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
    message: "Variant fetched successfully",
    variant,
    variantSubData,
  });
};

exports.update = async (req, res, next) => {
  let {
    id,
    name,
    defaultDataSV,
    defaultDataDataNewSv,
    dataToSend,
    dataToSendSV,
    dataToSendNewSV,
    deleteIds,
  } = req.body;

  try {
    await Variant.findByIdAndUpdate(id, {
      $set: {
        name,
      },
    });

    //To aggregate variants (in products) everytime + firstVariantId, secondVariantId, firstSubVariantId, secondSubVariantId in productvariants

    //or to change in these whenever data updates.
    //this will not happen most of the time. So, would be saving time.

    /*

    in products
    variants[{name}] using id with name(from body)

    in productvariants
    firstVariantName = firstVariantId using id(from body)
    secondVariantName = secondVariantId using id(from body)

    firstSubVariantName = firstSubVariantId using defaultDataSV's id
    secondSubVariantName = secondSubVariantId using defaultDataSV's id

    will do in the background

    can also check what actually changed, change that thing only

    */

    let updateAllProducts = Product.updateMany(
      {
        isDeleted: false,
        "variants.id": ObjectId(id),
      },
      {
        $set: {
          "variants.$.name": name,
        },
      }
    );

    let updateAllPVFirstVariant = ProductVariant.updateMany(
      {
        isDeleted: false,
        firstVariantId: ObjectId(id),
      },
      {
        $set: {
          firstVariantName: name,
        },
      }
    );

    let updateAllPVSecondVariant = ProductVariant.updateMany(
      {
        isDeleted: false,
        secondVariantId: ObjectId(id),
      },
      {
        $set: {
          secondVariantName: name,
        },
      }
    );

    const promises = [
      updateAllProducts,
      updateAllPVFirstVariant,
      updateAllPVSecondVariant,
    ];

    defaultDataSV.forEach((v) => {
      promises.push(
        ProductVariant.updateMany(
          {
            firstSubVariantId: ObjectId(v.id),
          },
          {
            $set: {
              firstSubVariantName: v.name,
            },
          }
        )
      );

      promises.push(
        ProductVariant.updateMany(
          {
            secondSubVariantId: ObjectId(v.id),
          },
          {
            $set: {
              secondSubVariantName: v.name,
            },
          }
        )
      );
    });

    Promise.all(promises)
      .then()
      .catch((err) => console.log(err));

    // let updateAllPVSecondSubVariant = ProductVariant.updateMany(
    //   {
    //     isDeleted: false,
    //     secondVariantId: ObjectId(id),
    //   },
    //   {
    //     $set: {
    //       secondVariantName: name,
    //     },
    //   }
    // );
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const promises = [];

  defaultDataSV.forEach((data) => {
    const output = SubVariant.findByIdAndUpdate(data.id, {
      $set: {
        name: data.name,
        categoriesId: data.categoriesId,
      },
    });
    promises.push(output);
  });

  dataToSend.forEach((data) => {
    const output = MasterDescription.findByIdAndUpdate(data.id, {
      name: data.name,
    });
    promises.push(output);
  });

  dataToSendSV.forEach((data) => {
    const output = MasterDescription.findByIdAndUpdate(data.id, {
      name: data.name,
    });
    promises.push(output);
  });

  if (deleteIds.length > 0) {
    promises.push(
      SubVariant.updateMany(
        {
          _id: {
            $in: deleteIds.map((d) => ObjectId(d)),
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

  for (let i = 0; i < defaultDataDataNewSv.length; i++) {
    const newSubVariant = new SubVariant({
      ...defaultDataDataNewSv[i],
      variantId: id,
    });

    //TODO: update algo from frontend and remove this code.
    const indexes = [];

    const incrementBy = defaultDataDataNewSv.length;

    for (let j = i; j < dataToSendNewSV.length; j += incrementBy) {
      indexes.push(j);
    }

    // promises.push(newSubVariant.save());
    await newSubVariant.save();

    const toInsert = dataToSendNewSV.filter((_, idx) => indexes.includes(idx));

    promises.concat(
      MasterDescription.insertMany(
        toInsert.map((data) => ({
          languageCode: data.code,
          name: data.name,
          mainPage: newSubVariant._id,
          key: "subVariant",
        }))
      )
    );
  }

  try {
    await Promise.all(promises);
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
    message: "Variant updated successfully",
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Variant.findByIdAndUpdate(id, {
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
    message: "Variant's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.getVariantByCategory = async (req, res, next) => {
  const { id } = req.query;

  let variants;

  const idArr = [];

  if (id) {
    idArr.push({
      $addFields: {
        "variants.isChecked": {
          $in: [new ObjectId(id), "$variants.categoriesId"],
        },
      },
    });
  } else {
    idArr.push({
      $addFields: {
        "variants.isChecked": false,
      },
    });
  }

  try {
    variants = await Variant.aggregate([
      {
        $match: {
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
                  {
                    vendorId: {
                      $exists: false,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                categoriesId: 1,
              },
            },
          ],
          as: "variants",
        },
      },
      {
        $unwind: {
          path: "$variants",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "variants.categoriesId": {
            $ifNull: ["$variants.categoriesId", []],
          },
        },
      },
      ...idArr,
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
          variants: {
            $push: "$variants",
          },
        },
      },
    ]);
  } catch (err) {
    console.log(err);
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
    message: "Variant's fetched successfully.",
    variants,
  });
};

exports.getVariantForProduct = async (req, res, next) => {
  const { id, vid } = req.params;

  let variants;

  try {
    variants = await Variant.aggregate([
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
                $or: [
                  {
                    $expr: {
                      $eq: ["$vendorId", new ObjectId(vid)],
                    },
                  },
                  {
                    vendorId: {
                      $exists: false,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                categoriesId: 1,
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
        $match: {
          "variants.categoriesId": {
            $in: [new ObjectId(id)],
          },
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
    message: "Variants fetched successfully.",
    variants,
  });
};
