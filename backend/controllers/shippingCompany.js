const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../http-error");
const { SORT, SKIP, LIMIT } = require("../utils/aggregate");

const ShippingCompany = require("../models/shippingCompany");
const ShippingCompanyDescription = require("../models/shippingCompanyDescription");
const ShippingArea = require("../models/shippingArea");
const ShippingPrice = require("../models/shippingPrice");

const Country = require("../models/country");
const Currency = require("../models/currency");
const City = require("../models/city");

exports.create = async (req, res, next) => {
  let { defaultData, languageData } = req.body;
  defaultData = JSON.parse(defaultData);
  languageData = JSON.parse(languageData);

  defaultData.logo = req.file.path;

  const newShippingCompany = new ShippingCompany(defaultData);

  languageData = languageData.map((data) => {
    data.shippingCompanyId = newShippingCompany._id;
    return data;
  });

  try {
    await Promise.all([
      newShippingCompany.save(),
      ShippingCompanyDescription.insertMany(languageData),
    ]);
  } catch (err) {
    console.log("Err", err);
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
    message: "Shipping company created successfully",
  });
};

exports.getAddData = async (req, res, next) => {
  let countries, currencies, selectedPriorityCountries;

  try {
    countries = Country.find({ isActive: true, isDeleted: false })
      .select("_id name")
      .lean();
    currencies = Currency.find({ isActive: true, isDeleted: false })
      .select("_id sign")
      .lean();
    selectedPriorityCountries = ShippingCompany.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $unwind: {
          path: "$priorityCountries",
        },
      },
      {
        $group: {
          _id: "x50",
          selectedCountries: {
            $push: "$priorityCountries",
          },
        },
      },
    ]);

    [countries, currencies, [selectedPriorityCountries]] = await Promise.all([
      countries,
      currencies,
      selectedPriorityCountries,
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

  if (selectedPriorityCountries) {
    selectedPriorityCountries = selectedPriorityCountries.selectedCountries.map(
      (c) => c.toString()
    );
  } else {
    selectedPriorityCountries = [];
  }

  let notSelectedPriorityCountries = countries;

  if (selectedPriorityCountries.length > 0) {
    notSelectedPriorityCountries = countries.filter(
      (c) => !selectedPriorityCountries.includes(c._id.toString())
    );
  }

  if (req.anotherApi) {
    return {
      status: true,
      countries,
      currencies,
      notSelectedPriorityCountries,
    };
  }

  res.status(200).json({
    status: true,
    message: "Shipping add data fetched successfully",
    countries,
    currencies,
    notSelectedPriorityCountries,
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

  let shippingCompanies, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }

  try {
    if (page == 1) {
      totalDocuments = ShippingCompany.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      shippingCompanies = ShippingCompany.find({
        name: { $regex: name, $options: "i" },
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();

      [totalDocuments, shippingCompanies] = await Promise.all([
        totalDocuments,
        shippingCompanies,
      ]);
    } else {
      shippingCompanies = await ShippingCompany.find({
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
      "Could not fetch shipping companies.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Shipping Companies Fetched successfully.",
    shippingCompanies,
    totalDocuments,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await ShippingCompany.findByIdAndUpdate(id, {
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
    message: "Company's status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await ShippingCompany.findByIdAndUpdate(id, { isDeleted: true });
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
    message: "Shipping Company deleted Successfully",
    id,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  req.anotherApi = true;

  let shippingCompany;

  try {
    shippingCompany = ShippingCompany.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "currencies",
          let: {
            id: "$currency",
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
            {
              $project: {
                sign: 1,
              },
            },
          ],
          as: "currencyData",
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            ids: "$priorityCountries",
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
          as: "priorityCountriesData",
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            ids: "$servingCountries",
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
          as: "servingCountriesData",
        },
      },
      {
        $lookup: {
          from: "shippingcompanydescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$shippingCompanyId", "$$id"],
                },
              },
            },
            {
              $project: {
                shippingCompanyId: 0,
                __v: 0,
                createdAt: 0,
                updatedAt: 0,
              },
            },
          ],
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$currencyData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          isDeleted: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);

    [[shippingCompany], editData] = await Promise.all([
      shippingCompany,
      this.getAddData(req, res, next),
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

  const { countries, currencies, notSelectedPriorityCountries } = editData;

  res.status(200).json({
    status: true,
    message: "Shipping Company's data fetched successfully",
    shippingCompany,
    countries,
    currencies,
    notSelectedPriorityCountries,
  });
};

exports.update = async (req, res, next) => {
  let { defaultData, languageData, id } = req.body;

  defaultData = JSON.parse(defaultData);
  languageData = JSON.parse(languageData);

  if (req.file?.path) {
    defaultData.logo = req.file.path;
  }

  try {
    const promises = [
      ShippingCompany.findByIdAndUpdate(id, {
        $set: defaultData,
      }),
    ];

    languageData.forEach((lang) => {
      promises.push(
        ShippingCompanyDescription.findByIdAndUpdate(lang.id, {
          $set: lang,
        })
      );
    });

    await Promise.all(promises);
  } catch (err) {
    console.log("Err", err);
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
    message: "Shipping company updated successfully",
  });
};

exports.getAreaAddData = async (req, res, next) => {
  let countries, cities;

  try {
    countries = Country.aggregate([
      {
        $match: {
          isDeleted: false,
          // currency: {
          //   $exists: true,
          // },
          // _id: ObjectId("6515264e01fd174be7c7684d"),
          // _id: {
          //   $in: [
          //     ObjectId("6515261601fd174be7c6da5d"),
          //     ObjectId("6515267801fd174be7c7a623"),
          //     ObjectId("6515264e01fd174be7c7684d"),
          //   ],
          // },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
      {
        $lookup: {
          from: "cities",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$parentId", "$$id"],
                },
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
          ],
          as: "children",
        },
      },
      {
        $addFields: {
          isExpanded: true,
        },
      },
      {
        $project: {
          _id: 0,
          label: "$name",
          value: "$_id",
          children: 1,
          isExpanded: 1,
        },
      },
      // {
      //   $match: {
      //     children: {
      //       $gt: [
      //         {
      //           $size: "$children",
      //         },
      //         0,
      //       ],
      //     },
      //   },
      // },
    ]);

    // cities = City.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       label: "$name",
    //       value: "$_id",
    //       parentId: 1,
    //     },
    //   },
    // ]);

    [countries, cities] = await Promise.all([countries, cities]);
  } catch (err) {
    console.log("Err", err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong.",
      500
    );
    return next(error);
  }

  // for (let j = 0; j < countries.length; j++) {
  //   let country = countries[j];

  //   let countryCities = cities.filter(
  //     (city) => city.parentId.toString() == country.value.toString()
  //   );

  //   countries[j].children = countryCities;
  // }

  res.status(200).json({
    status: true,
    message: "Data for area fetched successfully",
    countries,
  });
};

exports.updateAreas = async (req, res, next) => {
  const { newAreas, deletedAreas, oldAreas } = req.body;
  const promises = [];

  if (newAreas.length > 0) {
    promises.push(ShippingArea.insertMany(newAreas));
  }

  if (deletedAreas.length > 0) {
    promises.push(
      ShippingArea.deleteMany({
        _id: {
          $in: deletedAreas.map((d) => ObjectId(d)),
        },
      })
    );
  }

  if (oldAreas.length) {
    oldAreas.forEach((area) => {
      promises.push(
        ShippingArea.findByIdAndUpdate(area.id, {
          $set: {
            name: area.name,
            areas: area.areas,
          },
        })
      );
    });
  }

  try {
    await Promise.all(promises);
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

  res.status(200).json({
    status: true,
    message: "Areas saved successfully",
  });
};

exports.getAreasData = async (req, res, next) => {
  const { id } = req.params;

  let areas;

  try {
    // areas = await ShippingArea.aggregate([
    //   {
    //     $match: {
    //       shippingId: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       let: {
    //         id: "$country",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $eq: ["$_id", "$$id"],
    //             },
    //             isDeleted: false,
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
    //       as: "countryData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "cities",
    //       let: {
    //         ids: "$cities",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $in: ["$_id", "$$ids"],
    //             },
    //             isDeleted: false,
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
    //       as: "citiesData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$countryData",
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       countryData: 1,
    //       citiesData: 1,
    //       cities: 1,
    //     },
    //   },
    // ]);

    // areas = await ShippingArea.find({ shippingId: ObjectId(id) });

    areas = await ShippingArea.aggregate([
      {
        $match: {
          shippingId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            areas: "$areas",
          },
          pipeline: [
            {
              $match: {
                isDeleted: false,
                // currency: {
                //   $exists: true,
                // },
              },
            },
            {
              $addFields: {
                checked: {
                  $in: ["$_id", "$$areas"],
                },
                isExpanded: false,
              },
            },
            // {
            //   $lookup: {
            //     from: "cities",
            //     let: {
            //       id: "$_id",
            //     },
            //     pipeline: [
            //       {
            //         $match: {
            //           $expr: {
            //             $eq: ["$parentId", "$$id"],
            //           },
            //           isDeleted: false,
            //           $and: [
            //             {
            //               $expr: {
            //                 $in: ["$_id", "$$areas"],
            //               },
            //             },
            //           ],
            //         },
            //       },
            //       {
            //         $addFields: {
            //           // checked: {
            //           //   $in: ["$_id", "$$areas"],
            //           // },
            //           checked: true,
            //         },
            //       },
            //       {
            //         $project: {
            //           _id: 0,
            //           label: "$name",
            //           value: "$_id",
            //           checked: 1,
            //         },
            //       },
            //     ],
            //     as: "children",
            //   },
            // },
            // {
            //   $match: {
            //     $or: [
            //       {
            //         checked: true,
            //       },
            //       {
            //         $expr: {
            //           $gt: [{ $size: "$children" }, 0],
            //         },
            //       },
            //     ],
            //   },
            // },
            {
              $sort: {
                name: 1,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
                children: 1,
                checked: 1,
                isExpanded: 1,
              },
            },
          ],
          as: "countries",
        },
      },
      {
        $lookup: {
          from: "cities",
          let: {
            areas: "$areas",
          },
          pipeline: [
            {
              $match: {
                isDeleted: false,
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$areas"],
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                checked: true,
              },
            },
            {
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
                checked: 1,
                parentId: 1,
              },
            },
          ],
          as: "cities",
        },
      },
    ]);
    // .allowDiskUse(true);
    // .option({ allowDiskUse: true });
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

  for (let i = 0; i < areas.length; i++) {
    let countries = areas[i].countries;
    let cities = areas[i].cities;

    for (let j = 0; j < countries.length; j++) {
      let country = countries[j];

      let countryCities = cities.filter(
        (city) => city.parentId.toString() == country.value.toString()
      );

      if (countryCities.length > 0) {
        areas[i].countries[j].children = countryCities;
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Areas fetched successfully",
    areas,
  });
};

exports.updatePrices = async (req, res, next) => {
  const { id, shippingId, weights, areas } = req.body;

  try {
    if (id) {
      await ShippingPrice.findByIdAndUpdate(id, {
        $set: {
          weights,
          areas,
        },
      });
    } else {
      const newShippingPrice = new ShippingPrice({
        shippingId,
        weights,
        areas,
      });
      await newShippingPrice.save();
    }
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

  res.status(200).json({
    status: true,
    message: "Prices saved successfully",
  });
};

exports.getPricesData = async (req, res, next) => {
  const id = req.params.id;

  let prices = [];

  try {
    [prices] = await ShippingPrice.aggregate([
      {
        $match: {
          shippingId: new ObjectId(id),
        },
      },
      {
        $unwind: {
          path: "$areas",
        },
      },
      {
        $lookup: {
          from: "shippingareas",
          let: {
            id: "$areas.areaId",
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
              $project: {
                _id: 0,
                label: "$name",
                value: "$_id",
              },
            },
          ],
          as: "areas.areaData",
        },
      },
      {
        $unwind: {
          path: "$areas.areaData",
        },
      },
      {
        $group: {
          _id: "$_id",
          areas: {
            $push: "$areas",
          },
          weights: {
            $first: "$weights",
          },
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
    message: "Prices fetched successfully",
    prices,
  });
};
