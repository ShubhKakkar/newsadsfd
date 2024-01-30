const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

const Manufactures = require("../models/manufacture");
const HttpError = require("../http-error");
const Brand = require("../models/brand");
const { languages } = require("../utils/helper");
const MasterDescription = require("../models/masterDescription");
const Group = require("../models/group");

// const { SORT, LIMIT }                       = require("../utils/aggregate");
exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Validation failed, entered data is incorrect",
      422
    );
    return next(error);
  }

  const {
    name,
    location,
    industry,
    vendor,
    employees,
    brands,
    newBrands,
    groupId,
  } = req.body;

  let allBrands = brands;

  try {
    if (newBrands.length > 0) {
      // let newBrandsRes = await Brand.insertMany(
      //   newBrands.map((b) => ({ name: b }))
      // );

      // newBrandsRes = newBrandsRes.map((b) => b._id.toString());
      // allBrands.concat(newBrandsRes);

      //because of slug
      const promises = [];

      for (let i = 0; i < newBrands.length; i++) {
        const brand = newBrands[i];

        const brandRes = new Brand({ name: brand.value });

        promises.push(
          MasterDescription.insertMany(
            brand.langData.map((lang) => ({
              languageCode: lang.languageCode,
              name: lang.value,
              mainPage: brandRes._id,
              key: "brand",
            }))
          )
        );

        promises.push(brandRes.save());
        allBrands.push(brandRes._id);
      }

      await Promise.all(promises);
    }

    let newManufactures = new Manufactures({
      name,
      country: location,
      industry,
      employees,
      brands: allBrands,
    });

    await newManufactures.save();

    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        $push: { members: newManufactures._id },
      });
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not create manufactures.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Manufacture has been added successfully.",
  });
};

exports.getAll = async (req, res, next) => {
  let {
    page,
    isActive,
    name,
    country,
    per_page,
    sortBy,
    order,
    dateFrom,
    dateTo,
  } = req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  isActive = isActive ?? "";
  name = name ?? "";
  country = country ?? "";
  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let searchFields = {};
  let conditions = { ...searchFields };

  conditions.isDeleted = false;

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (isActive) {
    conditions.isActive = "true" == isActive;
  }

  if (country) {
    conditions.country = country;
  }

  if (name) {
    conditions.name = { $regex: name, $options: "i" };
  }

  try {
    if (page == 1) {
      totalDocuments = await Manufactures.find(conditions)
        .lean()
        .select({ _id: 1 })
        .countDocuments();
      data = await Manufactures.find(conditions)
        .populate("country")
        // .populate({ path: "vendor", select: "businessName firstName lastName" })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    } else {
      data = await Manufactures.find(conditions)
        .populate("country")
        // .populate({ path: "vendor", select: "businessName firstName lastName" })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .select("-isDeleted")
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch manufactures.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Manufactures Fetched successfully.",
    data,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Manufactures.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change manufactures's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Manufactures's status changed successfully.",
    id,
    status,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    // data = await Manufactures.findById(id)
    //   // .populate("vendor", "_id businessName")
    //   .populate("country", "_id name")
    //   .populate("brand", "_id name")
    //   .lean();

    [data] = await Manufactures.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "countryData",
        },
      },
      {
        $lookup: {
          from: "brands",
          let: {
            ids: "$brands",
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
                name: 1,
              },
            },
          ],
          as: "brandData",
        },
      },
      {
        $project: {
          name: 1,
          industry: 1,
          country: {
            $arrayElemAt: ["$countryData", 0],
          },
          employees: 1,
          brands: "$brandData",
          isActive: 1,
          createdAt: 1,
        },
      },
    ]);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch manufactures's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Manufactures's data fetched successfully.",
    data,
  });
};

exports.update = async (req, res, next) => {
  const { id, name, location, industry, vendor, employees, brands, newBrands } =
    req.body;

  let allBrands = brands;

  try {
    if (newBrands.length > 0) {
      const promises = [];

      for (let i = 0; i < newBrands.length; i++) {
        const brand = newBrands[i];

        const brandRes = new Brand({ name: brand.value });

        promises.push(
          MasterDescription.insertMany(
            brand.langData.map((lang) => ({
              languageCode: lang.languageCode,
              name: lang.value,
              mainPage: brandRes._id,
              key: "brand",
            }))
          )
        );

        promises.push(brandRes.save());
        allBrands.push(brandRes._id);
      }

      await Promise.all(promises);
    }

    await Manufactures.findByIdAndUpdate(id, {
      $set: {
        name,
        country: location,
        industry,
        employees,
        brands: allBrands,
      },
    });
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
    message: "Manufactures has been updated successfully.",
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Manufactures.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not delete manufacture.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Manufacture has been deleted successfully.",
    id,
  });
};

exports.getAllSupplierManufacture = async (req, res, next) => {
  const { name } = req.query;
  let manufactures;
  try {
    manufactures = await Manufactures.aggregate([
      {
        $match: {
          name: new RegExp(name, "i"),
          isDeleted: false,
        },
      },
      {
        $project: {
          value: "$_id",
          label: "$name",
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetched manufactures",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Manufactures's featured successfully.",
    manufactures,
  });
};
