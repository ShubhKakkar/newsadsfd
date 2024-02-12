const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const parser = require("xml2json");
const xlsx = require("node-xlsx");

const HttpError = require("../http-error");
const idCreator = require("../utils/idCreator");
const {
  languages,
  findKeyPath,
  getAllCategories,
  mediaDownloadHandler,
} = require("../utils/helper");
const {
  addFile,
  removeFile,
  getFile,
  updateFile,
} = require("../utils/importHelper");

const Product = require("../models/product");
const Vendor = require("../models/vendor");
const ProductCategory = require("../models/productCategory");
const Brand = require("../models/brand");
const Unit = require("../models/unit");
const ProductVariant = require("../models/productVariant");
const SubVariant = require("../models/subVariant");
const MasterDescription = require("../models/masterDescription");
// const SubProductCategory = require("../models/SubProductCategory");
const Variant = require("../models/variant");
const ProductCategoryDescriptions = require("../models/productCategoryDescription");
// const SubProductCategoryDescriptions = require("../models/SubProductCategoryDescriptions");
const Warehouse = require("../models/warehouse");

const ProductDescription = require("../models/productDescription");
const ProductVariantDescription = require("../models/productVariantDescription");
const { LOOKUP_ORDER } = require("../utils/aggregate");
const VendorProduct = require("../models/vendorProduct");
const Currency = require("../models/currency");
const VendorProductVariant = require("../models/vendorProductVariant");
const Group = require("../models/group");
const ProductSync = require("../models/productSync");
const SubSpecificationGroupValue = require("../models/subSpecificationGroupValue");
const ShippingCompany = require("../models/shippingCompany");

// const Category = require("../models/category");

const VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
  "audio/ogg",
];

const helperObj = {
  Barcode: "barcode",
  Name_English: "name", //en
  Name_Arabic: "name_ar",
  Name_Turkish: "name_tr",
  Cat1name: "cat1name",
  Cat2name: "cat2name",
  Cat3name: "cat3name",
  Unit: "unit",
  BuyingPrice: "buying_price",
  SellingPrice: "selling_price",
  Brand: "brand",
  Height: "height",
  Weight: "weight",
  Width: "width",
  Length: "length",
  DC: "dc",
  "Shipping Company": "shipping_company",
  ProductLink_English: "product_link", //en
  ProductLink_Arabic: "product_link_ar",
  ProductLink_Turkish: "product_link_tr",
  ShortDescription_English: "short_description", //en
  ShortDescription_Arabic: "short_description_ar",
  ShortDescription_Turkish: "short_description_tr",
  LongDescription_English: "long_description", //en
  LongDescription_Arabic: "long_description_ar",
  LongDescription_Turkish: "long_description_tr",
  MetaTitle_English: "seo_title", //en
  MetaTitle_Arabic: "seo_title_ar",
  MetaTitle_Turkish: "seo_title_tr",
  MetaAuthor_English: "seo_author", //en
  MetaAuthor_Arabic: "seo_author_ar",
  MetaAuthor_Turkish: "seo_author_tr",
  MetaDescription_English: "seo_desc", //en
  MetaDescription_Arabic: "seo_desc_ar",
  MetaDescription_Turkish: "seo_desc_tr",
  MetaKeywords_English: "seo_keywords", //en
  MetaKeywords_Arabic: "seo_keywords_ar",
  MetaKeywords_Turkish: "seo_keywords_tr",
  Currency: "currency",
  AlternateProducts: "alternate_products",
  Media: "media",
};

const randomNumber = () => Math.random().toString(36).slice(-5);

exports.create = async (req, res, next) => {
  let {
    name,
    barCode,
    hsCode,
    categoryId,
    brandId,
    unitId,
    isPublished,
    // isHelper,
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    // featureTitle,
    height,
    weight,
    width,
    length,
    alternateProductIds,
    langData,
    featuredMediaId,
    mediaIds,
    variants,
    subVariants,
    dc,
    shippingCompany,
    // newSubVariants,
    // name,
    // masterCategoryId,
    // subCategoryId,
    // warehouses,
    // price,
    // discountedPrice,
    // quantity,
    // serialNumber,
    // prices,
    // shortDescription,
    // longDescription,
    // taxesData,
    // features,
    // description,
    // faqs,
    // inStock,
    // metaData,
    // vendor,
    // countries,
    groupId,
  } = req.body;

  const newSubVariants = [];

  // warehouses = JSON.parse(warehouses);
  // features = JSON.parse(features);
  // metaData = JSON.parse(metaData);
  mediaIds = JSON.parse(mediaIds);
  variants = JSON.parse(variants);
  subVariants = JSON.parse(subVariants);
  // newSubVariants = JSON.parse(newSubVariants);
  // faqs = JSON.parse(faqs);

  // prices = JSON.parse(prices);
  langData = JSON.parse(langData);
  // taxesData = JSON.parse(taxesData);
  // featuresLang = JSON.parse(featuresLang);
  // countries = JSON.parse(countries);
  alternateProductIds = JSON.parse(alternateProductIds);
  // faqsLang = JSON.parse(faqsLang);

  // const extras = {};

  if (req.files.ogImage) {
    metaData.ogImage = req.files.ogImage[0].path;
  }

  const allMedia = [];

  if (req.files.media) {
    req.files.media.forEach((m, idx) => {
      allMedia.push({ src: m.path, isImage: !VIDEO.includes(m.mimetype) });
    });
  }

  let newData = new Product({
    name,
    barCode,
    hsCode,
    categoryId,
    brandId,
    unitId,
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    // featureTitle,
    height,
    weight,
    width,
    length,
    dc,
    shippingCompany,
    alternateProducts: alternateProductIds,
    variants,
    isPublished,
    // isHelper,

    // name,
    // masterCategoryId,
    // subCategoryId,
    // warehouses,
    // prices,
    // taxes: taxesData,
    // quantity,
    // serialNumber,
    // features,
    // faqs,
    // shortDescription,
    // longDescription,
    // metaData,
    // vendor,
    // countries,
    // inStock,
    // media: mediaIds["main"].map((m, idx) => {
    //   return {
    //     ...allMedia[m],
    //     isFeatured: idx === +featuredMediaId,
    //   };
    // }),
    media: mediaIds["main"].map((m, idx) => {
      return allMedia[m];
    }),
    coverImage: mediaIds["main"].map((m, idx) => {
      return allMedia[m];
    })[+featuredMediaId].src,
    isApproved: true,
  });

  const mediaHandler = (idx) => {
    const media = [];
    mediaIds[idx]?.forEach((m) => {
      media.push(allMedia[m]);
    });
    return media;
  };

  try {
    const slugs = langData.map((lang) => lang.slug);

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

    const isSlugAlreadyExist = await ProductDescription.aggregate([
      {
        $match: {
          slug: {
            $in: slugs,
          },
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

    if (subVariants.length > 0) {
      //unique sub variant ids
      let subVariantIds = subVariants.reduce((acc, cv) => {
        if (cv.firstSubVariantId) {
          acc.add(cv.firstSubVariantId);
        }

        if (cv.secondSubVariantId) {
          acc.add(cv.secondSubVariantId);
        }

        return acc;
      }, new Set());

      //converting set to array
      subVariantIds = [...subVariantIds];

      //mainPage, languageCode => name
      subVariantIds = await MasterDescription.aggregate([
        {
          $match: {
            key: "subVariant",
            mainPage: {
              $in: subVariantIds.map((sv) => ObjectId(sv)),
            },
          },
        },
      ]);

      const subVariantIdsObj = {};

      //storing id_lang = name
      subVariantIds.forEach((sv) => {
        subVariantIdsObj[`${sv.mainPage}_${sv.languageCode}`] = sv.name;
      });

      const slugs = []; //storing all slugs
      const subVariantSlugs = {}; //slug: idx_lang

      subVariants.forEach((sv, idx) => {
        const langObj = {};

        langData.forEach((lang) => {
          let slug = `${lang.slug}-${
            subVariantIdsObj[`${sv.firstSubVariantId}_${lang.languageCode}`]
          }`;

          if (sv.secondSubVariantId) {
            slug += `-${
              subVariantIdsObj[`${sv.secondSubVariantId}_${lang.languageCode}`]
            }`;
          }

          subVariantSlugs[slug] = `${idx}_${lang.languageCode}`;

          langObj[lang.languageCode] = slug;

          slugs.push(slug);
        });

        sv.langObj = langObj;
      });

      let notValidatedSlugs = [...slugs];

      let areSlugsValid = false;

      while (!areSlugsValid) {
        let exists = await ProductVariantDescription.aggregate([
          {
            $match: {
              slug: {
                $in: notValidatedSlugs,
              },
            },
          },
        ]);

        if (exists.length > 0) {
          notValidatedSlugs = [];

          exists.forEach((obj) => {
            let slug = obj.slug;
            let newSlug = obj.slug + "-" + randomNumber();

            let [subVariantIdx, subVariantLang] =
              subVariantSlugs[slug].split("_");

            //change in subVariants using subVariantSlugs

            subVariants[subVariantIdx] = {
              ...subVariants[subVariantIdx],
              langObj: {
                ...subVariants[subVariantIdx].langObj,
                [subVariantLang]: newSlug,
              },
            };

            //change in subVariantSlugs

            delete subVariantSlugs[slug];
            subVariantSlugs[newSlug] = `${subVariantIdx}_${subVariantLang}`;

            notValidatedSlugs.push(newSlug);
          });
        } else {
          areSlugsValid = true;
        }
      }
    }

    await newData.save();
    const subVariantsPromise = [];

    for (let i = 0; i < langData.length; i++) {
      let obj = langData[i];
      obj.productId = newData._id;
      obj = new ProductDescription(obj);
      await obj.save();
      // subVariantsPromise.push(obj.save());
    }

    if (groupId) {
      const newGroup = Group.findByIdAndUpdate(groupId, {
        $push: { members: newData._id },
      });
      subVariantsPromise.push(newGroup);
    }

    // subVariantsPromise.concat(
    //   MasterDescription.insertMany(
    //     descriptionLangData.map((desc) => ({
    //       ...desc,
    //       mainPage: newData._id,
    //       key: "productDesc",
    //     }))
    //   )
    // );

    // {
    //   const featuresArr = [];

    //   for (let key in featuresLang) {
    //     featuresArr.push({
    //       languageCode: key,
    //       features: featuresLang[key],
    //       mainPage: newData._id,
    //       key: "productFeatures",
    //     });
    //   }

    //   subVariantsPromise.concat(MasterDescription.insertMany(featuresArr));
    // }

    // subVariantsPromise.concat(
    //   MasterDescription.insertMany(
    //     featuresLang.map((desc) => ({
    //       ...desc,
    //       mainPage: newData._id,
    //       key: "productFeatures",
    //     }))
    //   )
    // );

    // {
    //   const faqsArr = [];

    //   for (let key in faqsLang) {
    //     faqsArr.push({
    //       languageCode: key,
    //       faqs: faqsLang[key],
    //       mainPage: newData._id,
    //       key: "productFaqs",
    //     });
    //   }

    //   subVariantsPromise.concat(MasterDescription.insertMany(faqsArr));
    // }

    // subVariantsPromise.concat(
    //   MasterDescription.insertMany(
    //     faqsLang.map((desc) => ({
    //       ...desc,
    //       mainPage: newData._id,
    //       key: "productFaqs",
    //     }))
    //   )
    // );

    if (false && newSubVariants.length > 0) {
      const toAdd = subVariants.filter(
        (s) => typeof s.firstSubVariantId === "number"
      );
      if (toAdd.length > 0) {
        const idsAdded = [];
        for (let i = 0; i < toAdd.length; i++) {
          const data = newSubVariants.find(
            (sv) => sv.id === toAdd[i].firstSubVariantId
          );

          if (idsAdded.includes(data.id)) {
            continue;
          }

          const { id, name, subCategoryId, variantId, languagesData } = data;

          const newSubVariant = new SubVariant({
            name,
            categoriesId: [subCategoryId],
            variantId,
            vendorId: vendor,
          });

          subVariantsPromise.push(newSubVariant.save());

          subVariantsPromise.concat(
            MasterDescription.insertMany(
              languagesData.map((data) => ({
                languageCode: data.code,
                name: data.name,
                mainPage: newSubVariant._id,
                key: "subVariant",
              }))
            )
          );

          // const idx = subVariants.findIndex(
          //   (sv) => sv.firstSubVariantId === id
          // );

          // subVariants[idx].firstSubVariantId = newSubVariant._id;

          subVariants = subVariants.map((sv) => {
            if (sv.firstSubVariantId === id) {
              return { ...sv, firstSubVariantId: newSubVariant._id };
            }
            return sv;
          });
        }
      }

      const toAdd2 = subVariants.filter(
        (s) => typeof s.secondSubVariantId === "number"
      );

      if (toAdd2.length > 0) {
        const idsAdded = [];
        for (let i = 0; i < toAdd2.length; i++) {
          const data = newSubVariants.find(
            (sv) => sv.id === toAdd2[i].secondSubVariantId
          );

          if (idsAdded.includes(data.id)) {
            continue;
          }

          const { id, name, subCategoryId, variantId, languagesData } = data;

          const newSubVariant = new SubVariant({
            name,
            categoriesId: [subCategoryId],
            variantId,
            vendorId: vendor,
          });

          subVariantsPromise.push(newSubVariant.save());

          subVariantsPromise.concat(
            MasterDescription.insertMany(
              languagesData.map((data) => ({
                languageCode: data.code,
                name: data.name,
                mainPage: newSubVariant._id,
                key: "subVariant",
              }))
            )
          );

          idsAdded.push(id);

          // const idx = subVariants.findIndex(
          //   (sv) => sv.secondSubVariantId === id
          // );

          // subVariants[idx].secondSubVariantId = newSubVariant._id;

          subVariants = subVariants.map((sv) => {
            if (sv.secondSubVariantId === id) {
              return { ...sv, secondSubVariantId: newSubVariant._id };
            }
            return sv;
          });
        }
      }
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

      for (let i = 0; i < subVariants.length; i++) {
        let obj = {
          ...subVariants[i],
          mainProductId: newData._id,
          media: mediaHandler(i),
        };

        obj = new ProductVariant(obj);
        await obj.save();
        // subVariantsPromise.push(obj.save());

        for (let j = 0; j < languages.length; j++) {
          const lang = languages[j];
          let subObj = {
            productVariantId: obj._id,
            languageCode: lang.code,
            name: langData[j].name,
            // slug: `${langData[j].slug}-${i}`,
            slug: subVariants[i].langObj[lang.code],
          };

          subObj = new ProductVariantDescription(subObj);
          subVariantsPromise.push(subObj.save());
        }
      }

      newData.variantId = subVariants.length - 1;

      // await newData.save();
      subVariantsPromise.push(newData.save());
    }

    await Promise.all(subVariantsPromise);
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

exports.getAll = async (req, res, next) => {
  let {
    page,
    per_page,
    sortBy,
    order,
    isActive,
    name,
    vendor,
    dateFrom,
    dateTo,
    masterCategoryId,
    brandId,
    price,
    customId,
    isApproved,
    isSponsored,
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

  per_page = +per_page ?? 10;

  let data, totalDocuments;

  let conditions = {};

  if (dateFrom && dateTo) {
    conditions.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  if (name) {
    conditions.name = RegExp(name, "i");
  }

  if (isActive) {
    conditions.isActive = isActive === "true";
  }

  if (vendor) {
    conditions.vendor = ObjectId(vendor);
  }

  if (masterCategoryId) {
    conditions.categoryId = ObjectId(masterCategoryId);
  }

  if (brandId) {
    conditions.brandId = ObjectId(brandId);
  }

  if (price) {
    conditions.price = price;
  }

  if (customId) {
    conditions.customId = customId;
  }

  if (isApproved) {
    conditions.isApproved = false;
  }

  if (isSponsored) {
    conditions.isSponsored = false;
  }

  const PIPELINE_TOTAL = {
    $match: {
      isDeleted: false,
      ...conditions,
    },
  };

  const PIPELINE = [
    PIPELINE_TOTAL,
    // {
    //   $lookup: {
    //     from: "vendors",
    //     localField: "vendor",
    //     foreignField: "_id",
    //     as: "vendorData",
    //   },
    // },
    {
      $lookup: {
        from: "productcategories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryData",
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
    // {
    //   $unwind: {
    //     path: "$vendorData",
    //   },
    // },
    {
      $unwind: {
        path: "$categoryData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$brandData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        [sortBy]: order === "desc" ? -1 : 1,
      },
    },
    {
      $skip: (page - 1) * per_page,
    },
    {
      $limit: per_page,
    },
    {
      $project: {
        name: 1,
        sellingPrice: 1,
        isPublished: 1,
        status: {
          $cond: [
            {
              $eq: ["$isPublished", true],
            },
            "Publish",
            "Draft",
          ],
        },
        isActive: 1,
        createdAt: 1,
        customId: 1,
        categoryName: "$categoryData.name",
        brandName: "$brandData.name",
        isApproved: 1,
        isSponsored: 1,
      },
    },
  ];

  try {
    if (page == 1) {
      totalDocuments = await Product.aggregate([PIPELINE_TOTAL]);
    }
    data = await Product.aggregate(PIPELINE);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch products.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product fetched successfully.",
    data,
    totalDocuments: totalDocuments ? totalDocuments.length : null,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Product.findByIdAndUpdate(id, {
      isActive: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product's status",
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

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let data;

  try {
    [data] = await Product.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          isDeleted: false,
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
        $lookup: {
          from: "productcategories",
          localField: "masterCategoryId",
          foreignField: "_id",
          as: "masterCategoryData",
        },
      },
      {
        $lookup: {
          from: "subproductcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategoryData",
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
        $addFields: {
          warehouses: {
            $ifNull: ["$warehouses", []],
          },
        },
      },
      {
        $lookup: {
          from: "warehouses",
          let: {
            warehouses: "$warehouses",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ["$_id", "$$warehouses"],
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
                from: "countries",
                let: {
                  id: "$country",
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
                as: "countryData",
              },
            },
            {
              $unwind: {
                path: "$countryData",
              },
            },
            {
              $project: {
                name: 1,
                address: 1,
                city: 1,
                state: 1,
                street: 1,
                isActive: 1,
                countryName: "$countryData.name",
              },
            },
          ],
          as: "warehouseData",
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
                      $eq: ["$$id", "$mainProductId"],
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
                firstVariantName: 1,
                secondVariantName: 1,
                firstSubVariantName: 1,
                secondSubVariantName: 1,
                price: 1,
                discountedPrice: 1,
                media: 1,
                quantity: 1,
                width: 1,
                height: 1,
                weight: 1,
              },
            },
          ],
          as: "productVariantsData",
        },
      },
      {
        $unwind: {
          path: "$vendorData",
        },
      },
      {
        $unwind: {
          path: "$masterCategoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$subCategoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$brandData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          vendorName: "$vendorData.businessName",
          mainCategoryName: "$masterCategoryData.name",
          subCategoryName: "$subCategoryData.name",
          brandName: "$brandData.name",
        },
      },
      {
        $project: {
          masterCategoryId: 0,
          subCategoryId: 0,
          brandId: 0,
          warehouses: 0,
          vendor: 0,
          updatedAt: 0,
          isDeleted: 0,
          __v: 0,
          masterCategoryData: 0,
          subCategoryData: 0,
          brandData: 0,
          vendorData: 0,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch product's data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's data fetched successfully.",
    data,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    const [variantUpdatedObj] = await Promise.all([
      ProductVariant.updateMany(
        { mainProductId: ObjectId(id) },
        {
          isDeleted: true,
        }
      ),
      ProductDescription.updateMany({ productId: ObjectId(id) }, [
        {
          $set: {
            slug: { $concat: ["deleted__", `${id.toString()}`, "__", "$slug"] },
          },
        },
      ]),
      Product.findByIdAndUpdate(id, {
        $set: {
          isDeleted: true,
        },
      }),
    ]);

    if (+variantUpdatedObj.modifiedCount > 0) {
      let variantIds = await ProductVariant.find({
        mainProductId: ObjectId(id),
      })
        .select("_id")
        .lean();
      variantIds = variantIds.map((v) => ObjectId(v._id.toString()));

      if (variantIds.length > 0) {
        await ProductVariantDescription.updateMany(
          { productVariantId: { $in: variantIds } },
          [
            {
              $set: {
                slug: {
                  $concat: ["deleted__", `${id.toString()}`, "__", "$slug"],
                },
              },
            },
          ]
        );
      }
    }
  } catch (err) {
    console.log("err", err);
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

exports.addDetails = async (req, res, next) => {
  let vendors,
    customId,
    units,
    categories,
    brands,
    currencies,
    variantCustomId,
    shippingCompanies;

  try {
    // vendors = Vendor.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       approvalStatus: "approved",
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
    //       from: "countries",
    //       let: {
    //         serveCountries: "$serveCountries",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$serveCountries"],
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
    //       as: "countries",
    //     },
    //   },
    //   {
    //     $project: {
    //       mainCategories: 1,
    //       warehouses: 1,
    //       businessName: 1,
    //       countries: 1,
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

    units = Unit.find({ isDeleted: false }).select("_id name").lean();

    customId = idCreator("product", false);

    variantCustomId = idCreator("productVariant", false);

    shippingCompanies = ShippingCompany.find({ isDeleted: false }).select(
      "_id name"
    );

    [
      categories,
      customId,
      units,
      brands,
      currencies,
      variantCustomId,
      shippingCompanies,
    ] = await Promise.all([
      getAllCategories(),
      customId,
      units,
      brands,
      currencies,
      variantCustomId,
      shippingCompanies,
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data.",
      500
    );
    return next(error);
  }

  variantCustomId = variantCustomId.split("NMPV")[1];

  res.status(200).json({
    status: true,
    message: "Product add data fetched successfully",
    categories,
    customId,
    units,
    brands,
    currencies,
    variantCustomId: +variantCustomId,
    shippingCompanies,
  });
};

exports.getAllSearch = async (req, res, next) => {
  let vendors, brands, mainCategories;

  try {
    vendors = Vendor.find({ isDeleted: false, isActive: true })
      .select("_id businessName")
      .lean();

    brands = Brand.find({ isDeleted: false, isActive: true })
      .select("_id name")
      .lean();

    mainCategories = ProductCategory.find({ isDeleted: false, isActive: true })
      .select("_id name")
      .lean();

    [vendors, brands, mainCategories] = await Promise.all([
      vendors,
      brands,
      mainCategories,
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product search data fetched successfully",
    vendors,
    brands,
    mainCategories,
  });
};

exports.changeIsPublishedStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Product.findByIdAndUpdate(id, {
      isPublished: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's published status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.changeIsApprovedStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Product.findByIdAndUpdate(id, {
      isApproved: status,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product's status",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's is approved status changed successfully.",
    id,
    newStatus: status,
  });
};

exports.taxData = async (req, res, next) => {
  const { vendorId, categoryId } = req.params;

  let taxes, countries;

  try {
    taxes = Vendor.aggregate([
      {
        $match: {
          _id: new ObjectId(vendorId),
        },
      },
      {
        $unwind: {
          path: "$serveCountries",
        },
      },
      {
        $lookup: {
          from: "taxes",
          let: {
            country: "$serveCountries",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$countryId", "$$country"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$isDeleted", false],
                    },
                  },
                  {
                    $expr: {
                      $in: [new ObjectId(categoryId), "$productCategoryId"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "countries",
                let: {
                  country: "$countryId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$_id", "$$country"],
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
                as: "countryData",
              },
            },
            {
              $unwind: {
                path: "$countryData",
              },
            },
            {
              $project: {
                name: 1,
                tax: 1,
                countryData: 1,
              },
            },
          ],
          as: "taxData",
        },
      },
      {
        $unwind: {
          path: "$taxData",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$taxData",
        },
      },
      {
        $addFields: {
          tax: {
            id: "$_id",
            name: "$name",
            tax: "$tax",
          },
          countryName: "$countryData.name",
        },
      },
      {
        $group: {
          _id: "$countryData._id",
          countryName: {
            $first: "$countryName",
          },
          taxes: {
            $push: "$tax",
          },
        },
      },
    ]);

    countries = Vendor.aggregate([
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
                      $eq: ["$_id", new ObjectId(categoryId)],
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
                    $project: {
                      _id: 0,
                      label: "$name",
                      value: "$_id",
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
                countries: {
                  $push: "$countryData",
                },
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
        },
      },
    ]);

    [taxes, [countries]] = await Promise.all([taxes, countries]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch tax data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Tax data fetched successfully.",
    taxes,
    countries,
  });
};

exports.featuresAndFaqsData = async (req, res, next) => {
  const { id } = req.params;

  let data, specifications;

  try {
    // data = SubProductCategory.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "subproductcategorydescriptions",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$subProductCategoryId", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 0,
    //             languageCode: 1,
    //             features: 1,
    //             faqs: 1,
    //           },
    //         },
    //       ],
    //       as: "languages",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$languages",
    //     },
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: "$languages",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       features: {
    //         $ifNull: ["$features", []],
    //       },
    //       faqs: {
    //         $ifNull: ["$faqs", []],
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       featuresLength: {
    //         $size: "$features",
    //       },
    //       faqsLength: {
    //         $size: "$faqs",
    //       },
    //     },
    //   },
    //   {
    //     $match: {
    //       featuresLength: {
    //         $gt: 0,
    //       },
    //       faqsLength: {
    //         $gt: 0,
    //       },
    //     },
    //   },
    // ]);
    // specifications = SubProductCategory.aggregate([
    //   {
    //     $match: {
    //       _id: ObjectId(id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "specificationgroups",
    //       let: {
    //         ids: "$specification",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             isActive: true,
    //             isDeleted: false,
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
    //           $lookup: {
    //             from: "subspecificationgroups",
    //             let: {
    //               id: "$_id",
    //             },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   isActive: true,
    //                   isDeleted: false,
    //                   $and: [
    //                     {
    //                       $expr: {
    //                         $eq: ["$specificationId", "$$id"],
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 $lookup: {
    //                   from: "subspecificationgroupsdescriptions",
    //                   let: {
    //                     sid: "$_id",
    //                   },
    //                   pipeline: [
    //                     {
    //                       $match: {
    //                         $and: [
    //                           {
    //                             $expr: {
    //                               $eq: ["$subSpecificationId", "$$sid"],
    //                             },
    //                           },
    //                         ],
    //                       },
    //                     },
    //                   ],
    //                   as: "langData",
    //                 },
    //               },
    //               {
    //                 $project: {
    //                   langData: {
    //                     name: 1,
    //                     values: 1,
    //                     languageCode: 1,
    //                   },
    //                 },
    //               },
    //             ],
    //             as: "subData",
    //           },
    //         },
    //       ],
    //       as: "groupsData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$groupsData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$groupsData.subData",
    //     },
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: "$groupsData.subData",
    //     },
    //   },
    // ]);

    [data] = await ProductCategory.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
      "Could not fetch features and faqs",
      500
    );
    return next(error);
  }

  // [data, specifications] = await Promise.all([data, specifications]);

  res.status(200).json({
    status: true,
    message: "Features fetched successfully.",
    data,
    // specifications,
  });
};

exports.similarProducts = async (req, res, next) => {
  let similarProducts;
  const { term, category, brand, vendor } = req.query;

  const name = term ?? "";

  const searchObj = {};

  if (category) {
    searchObj.categoryId = ObjectId(category);
  }

  if (brand) {
    searchObj.brandId = ObjectId(brand);
  }

  if (vendor) {
    searchObj.vendor = ObjectId(v);
  }

  try {
    similarProducts = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isPublished: true,
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
          from: "subproductcategories",
          localField: "subCategoryId",
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
        $match: {
          name: RegExp(name, "i"),
          ...searchObj,
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
      "Could not fetch data.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product add data fetched successfully",
    // vendors,
    // brands,
    // customId,
    // units,
    similarProducts,
  });
};

exports.changeSponsored = async (req, res, next) => {
  const { id, sponsored } = req.body;

  try {
    await Product.findByIdAndUpdate(id, {
      isSponsored: sponsored,
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not change product's sponsored",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "product's sponsored changed successfully.",
    id,
    sponsored,
  });
};

exports.getEditData = async (req, res, next) => {
  const { id } = req.params;

  let product,
    taxes,
    editData,
    subProductData,
    units,
    similarProducts,
    variants,
    currencies,
    specifications,
    shippingCompanies;

  try {
    // [product] = await Product.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(id),
    //       isDeleted: false,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "vendors",
    //       let: {
    //         id: "$vendor",
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
    //             businessName: 1,
    //           },
    //         },
    //       ],
    //       as: "vendorData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productcategories",
    //       let: {
    //         id: "$masterCategoryId",
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
    //       as: "subCategoryData",
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
    //       as: "brandData",
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
    //     $addFields: {
    //       warehouses: {
    //         $ifNull: ["$warehouses", []],
    //       },
    //       taxes: {
    //         $ifNull: ["$taxes", []],
    //       },
    //       countries: {
    //         $ifNull: ["$countries", []],
    //       },
    //       alternateProducts: {
    //         $ifNull: ["$alternateProducts", []],
    //       },
    //       media: {
    //         $ifNull: ["$media", []],
    //       },
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
    //       from: "taxes",
    //       let: {
    //         ids: "$taxes.tax",
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
    //             countryId: 1,
    //           },
    //         },
    //       ],
    //       as: "taxData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "countries",
    //       let: {
    //         ids: "$countries",
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
    //       as: "countriesData",
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
    //     $lookup: {
    //       from: "masterdescriptions",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$key", "productDesc"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$mainPage", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             languageCode: 1,
    //             shortDescription: 1,
    //             longDescription: 1,
    //           },
    //         },
    //       ],
    //       as: "descriptionData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "masterdescriptions",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$key", "productFeatures"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$mainPage", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             languageCode: 1,
    //             features: 1,
    //           },
    //         },
    //       ],
    //       as: "featuresData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productvariants",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$mainProductId", "$$id"],
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
    //             firstVariantId: 1,
    //             secondVariantId: 1,
    //             firstVariantName: 1,
    //             secondVariantName: 1,
    //             firstSubVariantId: 1,
    //             secondSubVariantId: 1,
    //             firstSubVariantName: 1,
    //             secondSubVariantName: 1,
    //             quantity: 1,
    //             height: 1,
    //             weight: 1,
    //             width: 1,
    //             length: 1,
    //             prices: 1,
    //             media: 1,
    //           },
    //         },
    //       ],
    //       as: "variantsData",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "masterdescriptions",
    //       let: {
    //         id: "$_id",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$key", "productFaqs"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$mainPage", "$$id"],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $project: {
    //             languageCode: 1,
    //             faqs: 1,
    //           },
    //         },
    //       ],
    //       as: "faqsData",
    //     },
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       customId: 1,
    //       buyingPrice: 1,
    //       prices: 1,
    //       quantity: 1,
    //       serialNumber: 1,
    //       barCode: 1,
    //       featureTitle: 1,
    //       height: 1,
    //       weight: 1,
    //       width: 1,
    //       length: 1,
    //       metaData: 1,
    //       inStock: 1,
    //       vendor: { $arrayElemAt: ["$vendorData", 0] },
    //       category: { $arrayElemAt: ["$categoryData", 0] },
    //       subCategory: { $arrayElemAt: ["$subCategoryData", 0] },
    //       brand: { $arrayElemAt: ["$brandData", 0] },
    //       unit: { $arrayElemAt: ["$unitData", 0] },
    //       warehouse: "$warehousesData",
    //       tax: "$taxData",
    //       countries: "$countriesData",
    //       alternateProducts: "$alternateProductsData",
    //       descriptionData: 1,
    //       featuresData: 1,
    //       faqsData: 1,
    //       variantsData: 1,
    //       media: 1,
    //       variants: 1,
    //       isPublished: 1,
    //       isHelper: 1,
    //     },
    //   },
    // ]);

    product = Product.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: {
            id: "$categoryId",
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
                masterVariantId: 1,
                requiredSpecificationIds: 1,
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
          from: "shippingcompanies",
          let: {
            id: "$shippingCompany",
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
            $ifNull: ["$alternateProducts", []],
          },
          media: {
            $ifNull: ["$media", []],
          },
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
                  },
                ],
              },
            },
          ],
          as: "langData",
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
                ],
              },
            },
          ],
          as: "variantsData",
        },
      },
      {
        $project: {
          barCode: 1,
          hsCode: 1,
          customId: 1,
          categoryId: 1,
          brand: {
            $arrayElemAt: ["$brandData", 0],
          },
          unit: {
            $arrayElemAt: ["$unitData", 0],
          },
          categoryData: {
            $arrayElemAt: ["$categoryData", 0],
          },
          isPublished: 1,
          buyingPrice: 1,
          buyingPriceCurrency: 1,
          sellingPrice: 1,
          langData: 1,
          height: 1,
          weight: 1,
          width: 1,
          length: 1,
          alternateProducts: "$alternateProductsData",
          variantsData: 1,
          media: 1,
          variants: 1,
          coverImage: 1,
          dc: 1,
          // shippingCompany: 1,
          shippingCompany: {
            $arrayElemAt: ["$shippingCompanyData", 0],
          },
        },
      },
    ]);

    // taxes = Vendor.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(product.vendor._id),
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$serveCountries",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "taxes",
    //       let: {
    //         country: "$serveCountries",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $eq: ["$countryId", "$$country"],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $eq: ["$isDeleted", false],
    //                 },
    //               },
    //               {
    //                 $expr: {
    //                   $in: [
    //                     new ObjectId(product.category?._id),
    //                     "$productCategoryId",
    //                   ],
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $lookup: {
    //             from: "countries",
    //             let: {
    //               country: "$countryId",
    //             },
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $and: [
    //                     {
    //                       $expr: {
    //                         $eq: ["$_id", "$$country"],
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
    //           $project: {
    //             name: 1,
    //             tax: 1,
    //             countryData: 1,
    //           },
    //         },
    //       ],
    //       as: "taxData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$taxData",
    //     },
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: "$taxData",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       tax: {
    //         id: "$_id",
    //         name: "$name",
    //         tax: "$tax",
    //       },
    //       countryName: "$countryData.name",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$countryData._id",
    //       countryName: {
    //         $first: "$countryName",
    //       },
    //       taxes: {
    //         $push: "$tax",
    //       },
    //     },
    //   },
    // ]);

    // editData = Vendor.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       // approvalStatus: "approved",
    //       _id: new ObjectId(product.vendor._id),
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
    //     $project: {
    //       mainCategories: 1,
    //       warehouses: 1,
    //       businessName: 1,
    //     },
    //   },
    // ]);

    // countries = Vendor.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(product.vendor._id),
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
    //                   $eq: ["$_id", new ObjectId(product.category?._id)],
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
    //                 $project: {
    //                   _id: 0,
    //                   label: "$name",
    //                   value: "$_id",
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
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       countries: "$result.countries",
    //     },
    //   },
    // ]);

    // subProductData = SubProductCategory.aggregate([
    //   {
    //     $match: {
    //       _id: new ObjectId(product.subCategory?._id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "brands",
    //       let: {
    //         brands: "$brands",
    //       },
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $expr: {
    //                   $in: ["$_id", "$$brands"],
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
    //       as: "brandData",
    //     },
    //   },
    //   {
    //     $project: {
    //       brandData: 1,
    //     },
    //   },
    // ]);

    units = Unit.find({ isDeleted: false }).select("_id name").lean();

    // similarProducts = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       // isPublished: true,
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
    //     $lookup: {
    //       from: "subproductcategories",
    //       localField: "subCategoryId",
    //       foreignField: "_id",
    //       as: "categoryData",
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
    //       path: "$brandData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$categoryData",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$vendorData",
    //     },
    //   },
    //   {
    //     $project: {
    //       customId: 1,
    //       brandId: 1,
    //       name: 1,
    //       brandName: "$brandData.name",
    //       categoryId: "$categoryData._id",
    //       categoryName: "$categoryData.name",
    //       vendor: 1,
    //       vendorName: "$vendorData.businessName",
    //     },
    //   },
    //   {
    //     $sort: {
    //       createdAt: -1,
    //     },
    //   },
    //   {
    //     $limit: 9,
    //   },
    // ]);

    similarProducts = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: {
            $ne: ObjectId(id),
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
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
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
        $project: {
          customId: 1,
          brandId: 1,
          name: 1,
          brandName: "$brandData.name",
          categoryId: "$categoryData._id",
          categoryName: "$categoryData.name",
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
    //                   $eq: ["$vendorId", new ObjectId(product.vendor._id)],
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
    //         $in: [new ObjectId(product.subCategory?._id)],
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

    variants = Variant.aggregate([
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

    shippingCompanies = ShippingCompany.find({ isDeleted: false }).select(
      "_id name"
    );

    specifications = await ProductDescription.aggregate([
      {
        $match: {
          productId: new ObjectId(id),
          languageCode: "en",
        },
      },
      {
        $unwind: {
          path: "$features",
        },
      },
      {
        $lookup: {
          from: "subspecificationgroups",
          let: {
            label: "$features.label",
            value: "$features.value",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$label"],
                },
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
                      values: 1,
                      languageCode: 1,
                    },
                  },
                ],
                as: "langData",
              },
            },
            {
              $project: {
                name: 1,
                langData: 1,
                specificationId: 1,
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
                    $project: {
                      name: 1,
                      isSelected: {
                        $eq: ["$_id", "$$value"],
                      },
                    },
                  },
                  {
                    $sort: {
                      isSelected: -1,
                      createdAt: 1,
                    },
                  },
                  {
                    $limit: 10,
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
        $unwind: {
          path: "$specificationData",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$specificationData",
        },
      },
    ]);

    [
      // taxes,
      // [editData],
      // [subProductData],
      [product],
      units,
      similarProducts,
      variants,
      currencies,
      specifications,
      // [countries],
      shippingCompanies,
    ] = await Promise.all([
      // taxes,
      // // editData,
      // subProductData,
      product,
      units,
      similarProducts,
      variants,
      currencies,
      specifications,
      // countries,
      shippingCompanies,
    ]);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch data",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product data fetched successfully.",
    product,
    // taxes,
    // editData,
    // subProductData,
    units,
    similarProducts,
    variants,
    currencies,
    specifications,
    shippingCompanies,
    // countries,
  });
};

exports.update = async (req, res, next) => {
  let {
    name,
    barCode,
    hsCode,
    categoryId,
    // masterCategoryId,
    // subCategoryId,
    brandId,
    unitId,
    isPublished,
    // warehouses,
    // quantity,
    buyingPrice,
    buyingPriceCurrency,
    sellingPrice,
    // serialNumber,
    // featureTitle,
    // prices,
    // shortDescription,
    // longDescription,
    // descriptionLangData,
    // taxesData,
    // features,
    // featuresLang,
    // faqs,
    // faqsLang,
    // inStock,
    featuredMediaId,
    // metaData,
    // vendor,
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
    // newSubVariants,
    alternateProductIds,
    langData,
    id,
  } = req.body;

  const newSubVariants = [];

  // warehouses = JSON.parse(warehouses);
  // features = JSON.parse(features);
  // metaData = JSON.parse(metaData);
  mediaIds = JSON.parse(mediaIds);
  variants = JSON.parse(variants);
  subVariants = JSON.parse(subVariants);
  // newSubVariants = JSON.parse(newSubVariants);
  // faqs = JSON.parse(faqs);

  // prices = JSON.parse(prices);
  // descriptionLangData = JSON.parse(descriptionLangData);
  // taxesData = JSON.parse(taxesData);
  // featuresLang = JSON.parse(featuresLang);
  // countries = JSON.parse(countries);
  alternateProductIds = JSON.parse(alternateProductIds);
  // faqsLang = JSON.parse(faqsLang);
  langData = JSON.parse(langData);

  // const extras = {};

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
    const slugs = langData.map((lang) => lang.slug);

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

    const isSlugAlreadyExist = await ProductDescription.aggregate([
      {
        $match: {
          slug: {
            $in: slugs,
          },
          productId: {
            $ne: new ObjectId(id),
          },
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

    const oldProductData = await Product.findById(id)
      .select("media variants")
      .lean();

    // await newData.save();
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          barCode,
          hsCode,
          categoryId,
          // masterCategoryId,
          // subCategoryId,
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
          isPublished,
          // inStock,
          media: mediaIds["main"].map((m, idx) => allMedia[m]),
          coverImage: mediaIds["main"].map((m, idx) => {
            return allMedia[m];
          })[+featuredMediaId].src,
        },
      },
      { new: true }
    );

    // let variantId = updatedProduct.variantId;

    const subVariantsPromise = [];

    for (let i = 0; i < langData.length; i++) {
      let obj = langData[i];
      // obj.productId = newData._id;
      // obj = new ProductDescription(obj);

      subVariantsPromise.push(
        ProductDescription.findOneAndUpdate(
          {
            languageCode: obj.languageCode,
            productId: ObjectId(id),
          },
          {
            $set: {
              name: obj.name,
              shortDescription: obj.shortDescription,
              longDescription: obj.longDescription,
              features: obj.features,
              faqs: obj.faq,
              metaData: obj.metaData,
              slug: obj.slug,
            },
          }
        )
      );
    }

    // descriptionLangData.forEach((d) => {
    //   subVariantsPromise.push(
    //     MasterDescription.findOneAndUpdate(
    //       {
    //         languageCode: d.languageCode,
    //         mainPage: ObjectId(id),
    //         key: "productDesc",
    //       },
    //       {
    //         $set: {
    //           shortDescription: d.shortDescription,
    //           longDescription: d.longDescription,
    //         },
    //       }
    //     )
    //   );
    // });

    // for (let key in featuresLang) {
    //   subVariantsPromise.push(
    //     MasterDescription.findOneAndUpdate(
    //       {
    //         languageCode: key,
    //         mainPage: ObjectId(id),
    //         key: "productFeatures",
    //       },
    //       {
    //         $set: {
    //           features: featuresLang[key],
    //         },
    //       }
    //     )
    //   );
    // }

    // for (let key in faqsLang) {
    //   subVariantsPromise.push(
    //     MasterDescription.findOneAndUpdate(
    //       {
    //         languageCode: key,
    //         mainPage: ObjectId(id),
    //         key: "productFaqs",
    //       },
    //       {
    //         $set: {
    //           faqs: faqsLang[key],
    //         },
    //       }
    //     )
    //   );
    // }

    if (false && newSubVariants.length > 0) {
      const toAdd = subVariants.filter(
        (s) => typeof s.firstSubVariantId === "number"
      );
      if (toAdd.length > 0) {
        const idsAdded = [];
        for (let i = 0; i < toAdd.length; i++) {
          const data = newSubVariants.find(
            (sv) => sv.id === toAdd[i].firstSubVariantId
          );

          if (idsAdded.includes(data.id)) {
            continue;
          }

          const { id, name, subCategoryId, variantId, languagesData } = data;

          const newSubVariant = new SubVariant({
            name,
            categoriesId: [subCategoryId],
            variantId,
            vendorId: vendor,
          });

          subVariantsPromise.push(newSubVariant.save());

          subVariantsPromise.concat(
            MasterDescription.insertMany(
              languagesData.map((data) => ({
                languageCode: data.code,
                name: data.name,
                mainPage: newSubVariant._id,
                key: "subVariant",
              }))
            )
          );

          // const idx = subVariants.findIndex(
          //   (sv) => sv.firstSubVariantId === id
          // );

          // subVariants[idx].firstSubVariantId = newSubVariant._id;

          subVariants = subVariants.map((sv) => {
            if (sv.firstSubVariantId === id) {
              return { ...sv, firstSubVariantId: newSubVariant._id };
            }
            return sv;
          });
        }
      }

      const toAdd2 = subVariants.filter(
        (s) => typeof s.secondSubVariantId === "number"
      );

      if (toAdd2.length > 0) {
        const idsAdded = [];
        for (let i = 0; i < toAdd2.length; i++) {
          const data = newSubVariants.find(
            (sv) => sv.id === toAdd2[i].secondSubVariantId
          );

          if (idsAdded.includes(data.id)) {
            continue;
          }

          const { id, name, subCategoryId, variantId, languagesData } = data;

          const newSubVariant = new SubVariant({
            name,
            categoriesId: [subCategoryId],
            variantId,
            vendorId: vendor,
          });

          subVariantsPromise.push(newSubVariant.save());

          subVariantsPromise.concat(
            MasterDescription.insertMany(
              languagesData.map((data) => ({
                languageCode: data.code,
                name: data.name,
                mainPage: newSubVariant._id,
                key: "subVariant",
              }))
            )
          );

          idsAdded.push(id);

          // const idx = subVariants.findIndex(
          //   (sv) => sv.secondSubVariantId === id
          // );

          // subVariants[idx].secondSubVariantId = newSubVariant._id;

          subVariants = subVariants.map((sv) => {
            if (sv.secondSubVariantId === id) {
              return { ...sv, secondSubVariantId: newSubVariant._id };
            }
            return sv;
          });
        }
      }
    }

    let addedVariants = await ProductVariant.find({
      mainProductId: ObjectId(id),
      isDeleted: false,
    }).lean();

    let vendors = await VendorProduct.aggregate([
      {
        $match: {
          productId: new ObjectId(id),
          isDeleted: false,
        },
      },
      {
        $project: {
          vendorId: 1,
        },
      },
    ]);

    // subVariants.forEach(async (sv, idx) => {

    // });

    const variantsToAdd = [];

    for (let m = 0; m < subVariants.length; m++) {
      const idx = m;
      const sv = subVariants[m];

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
              // name,
              media: mediaHandler(idx),
            },
          })
        );

        for (let j = 0; j < languages.length; j++) {
          const lang = languages[j];

          subVariantsPromise.push(
            ProductVariantDescription.findOneAndUpdate(
              {
                productVariantId: ObjectId(isExist._id),
                languageCode: lang.code,
              },
              {
                name: langData[j].name,
              }
            )
          );
        }
      } else {
        variantsToAdd.push({
          ...sv,
          mainProductId: updatedProduct._id,
          media: mediaHandler(idx),
        });

        /*

        let newData = new ProductVariant({
          ...sv,
          mainProductId: updatedProduct._id,
          media: mediaHandler(idx),
        });

        await newData.save();

        //create for those who has already imported this product
        subVariantsPromise.push(
          VendorProductVariant.insertMany(
            vendors.map((v) => ({
              vendorId: v.vendorId,
              mainProductId: updatedProduct._id,
              productVariantId: newData._id,
              buyingPrice: 0,
              buyingPriceCurrency: sv.buyingPriceCurrency,
              sellingPrice: 0,
              discountedPrice: 0,
            }))
          )
        );

        for (let j = 0; j < languages.length; j++) {
          const lang = languages[j];
          let subObj = {
            productVariantId: newData._id,
            languageCode: lang.code,
            name: langData[j].name,
            // slug: `${langData[j].slug}-${i}`,
          };

          subObj = new ProductVariantDescription(subObj);
          subVariantsPromise.push(subObj.save());
        }

        */
      }
    }

    // if (updatedProduct.variantId !== variantId) {
    //   updatedProduct.variantId = variantId;

    //   subVariantsPromise.push(updatedProduct.save());
    // }

    if (variantsToAdd.length > 0) {
      //unique sub variant ids
      let subVariantIds = variantsToAdd.reduce((acc, cv) => {
        if (cv.firstSubVariantId) {
          acc.add(cv.firstSubVariantId);
        }

        if (cv.secondSubVariantId) {
          acc.add(cv.secondSubVariantId);
        }

        return acc;
      }, new Set());

      //converting set to array
      subVariantIds = [...subVariantIds];

      //mainPage, languageCode => name
      subVariantIds = await MasterDescription.aggregate([
        {
          $match: {
            key: "subVariant",
            mainPage: {
              $in: subVariantIds.map((sv) => ObjectId(sv)),
            },
          },
        },
      ]);

      const subVariantIdsObj = {};

      //storing id_lang = name
      subVariantIds.forEach((sv) => {
        subVariantIdsObj[`${sv.mainPage}_${sv.languageCode}`] = sv.name;
      });

      const slugs = []; //storing all slugs
      const subVariantSlugs = {}; //slug: idx_lang

      variantsToAdd.forEach((sv, idx) => {
        const langObj = {};

        langData.forEach((lang) => {
          let slug = `${lang.slug}-${
            subVariantIdsObj[`${sv.firstSubVariantId}_${lang.languageCode}`]
          }`;

          if (sv.secondSubVariantId) {
            slug += `-${
              subVariantIdsObj[`${sv.secondSubVariantId}_${lang.languageCode}`]
            }`;
          }

          subVariantSlugs[slug] = `${idx}_${lang.languageCode}`;

          langObj[lang.languageCode] = slug;

          slugs.push(slug);
        });

        sv.langObj = langObj;
      });

      let notValidatedSlugs = [...slugs];

      let areSlugsValid = false;

      while (!areSlugsValid) {
        let exists = await ProductVariantDescription.aggregate([
          {
            $match: {
              slug: {
                $in: notValidatedSlugs,
              },
            },
          },
        ]);

        if (exists.length > 0) {
          notValidatedSlugs = [];

          exists.forEach((obj) => {
            let slug = obj.slug;
            let newSlug = obj.slug + "-" + randomNumber();

            let [subVariantIdx, subVariantLang] =
              subVariantSlugs[slug].split("_");

            //change in variantsToAdd using subVariantSlugs

            variantsToAdd[subVariantIdx] = {
              ...variantsToAdd[subVariantIdx],
              langObj: {
                ...variantsToAdd[subVariantIdx].langObj,
                [subVariantLang]: newSlug,
              },
            };

            //change in subVariantSlugs

            delete subVariantSlugs[slug];
            subVariantSlugs[newSlug] = `${subVariantIdx}_${subVariantLang}`;

            notValidatedSlugs.push(newSlug);
          });
        } else {
          areSlugsValid = true;
        }
      }

      for (let i = 0; i < variantsToAdd.length; i++) {
        const sv = variantsToAdd[i];

        let obj = new ProductVariant(sv);
        await obj.save();

        subVariantsPromise.push(
          VendorProductVariant.insertMany(
            vendors.map((v) => ({
              vendorId: v.vendorId,
              mainProductId: sv.mainProductId,
              productVariantId: obj._id,
              buyingPrice: 0,
              buyingPriceCurrency: sv.buyingPriceCurrency,
              sellingPrice: 0,
              discountedPrice: 0,
            }))
          )
        );

        for (let j = 0; j < languages.length; j++) {
          const lang = languages[j];
          let subObj = {
            productVariantId: obj._id,
            languageCode: lang.code,
            name: langData[j].name,
            // slug: `${langData[j].slug}-${i}`,
            slug: sv.langObj[lang.code],
          };

          subObj = new ProductVariantDescription(subObj);
          subVariantsPromise.push(subObj.save());
        }
      }
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

      //delete for those who has already imported the product
      subVariantsPromise.push(
        VendorProductVariant.updateMany(
          {
            productVariantId: {
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

    // if (subVariants.length > 0) {
    //   await ProductVariant.insertMany(
    //     subVariants.map((data, idx) => ({
    //       ...data,
    //       mainProductId: newData._id,
    //       media: mediaHandler(idx),
    //       name,
    //       slug: `${newData.slug}-${idx}`,
    //     }))
    //   );

    //   newData.variantId = subVariants.length - 1;

    //   await newData.save();
    // }

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

  res.status(201).json({
    status: true,
    message: "Product Updated Successfully",
  });
};

exports.getAlternateProducts = async (req, res, next) => {
  const { name, category, brand, vendor, productId } = req.query;

  const searchObj = {};

  if (name) {
    searchObj.name = new RegExp(name, "i");
  }

  if (category && ObjectId.isValid(category)) {
    searchObj.categoryId = new ObjectId(category);
  }

  if (brand && ObjectId.isValid(brand)) {
    searchObj.brandId = new ObjectId(brand);
  }

  // if (vendor) {
  //   searchObj.vendor = new ObjectId(vendor);
  // }

  if (productId && ObjectId.isValid(productId)) {
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
          isPublished: true,
          isApproved: true,
          // isVendorActive: true,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
          ...searchObj,
        },
      },
      // {
      //   $match: {
      //     ...searchObj,
      //   },
      // },
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

exports.getAlternateProductSearchData = async (req, res, next) => {
  let searchBrands, searchCategories, searchVendors;

  try {
    searchBrands = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // isVendorActive: true,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
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
        $unwind: {
          path: "$brandData",
        },
      },
      {
        $group: {
          _id: "$brandData._id",
          name: {
            $first: "$brandData.name",
          },
        },
      },
    ]);

    searchCategories = Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          isPublished: true,
          isApproved: true,
          // isVendorActive: true,
          // countries: {
          //   $in: [new ObjectId(countryId)],
          // },
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
      {
        $unwind: {
          path: "$categoryData",
        },
      },
      {
        $group: {
          _id: "$categoryData._id",
          name: {
            $first: "$categoryData.name",
          },
        },
      },
    ]);

    // searchVendors = Product.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       isActive: true,
    //       // isPublished: true,
    //       isApproved: true,
    //       // isVendorActive: true,
    //       // countries: {
    //       //   $in: [new ObjectId(countryId)],
    //       // },
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

    [searchBrands, searchCategories, searchVendors] = await Promise.all([
      searchBrands,
      searchCategories,
      searchVendors,
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

  res.status(200).json({
    status: true,
    message: "Data fetched successfully",
    searchBrands,
    searchCategories,
    // searchVendors,
  });
};

exports.importFile = async (req, res, next) => {
  const { fileLink, container, containers } = req.body;

  const fileName = `${
    new Date().toISOString().replace(/:/g, "-") + "-"
  }-file.xml`;

  const directoryPath = path.resolve(
    __dirname,
    "..",
    // "..",
    "uploads",
    "images",
    "product-files",
    fileName
  );

  let localFile = fs.createWriteStream(directoryPath);

  const url = new URL(fileLink);
  let client = http;

  client = url.protocol == "https:" ? https : client;

  const request = client.get(fileLink, function (response) {
    response.on("end", function () {
      // const directoryPath = path.resolve(__dirname, "..", "..", "aa.xml");

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

        // let result = JSON.parse(JSON.stringify(json));

        let resultObj, result;

        if (container) {
          resultObj = findKeyPath(json, "", container);
          result = resultObj?.data;
        } else if (containers) {
          result = JSON.parse(JSON.stringify(json));

          containers.forEach((c) => {
            result = result?.[c];
          });
        }

        // containers.forEach((c) => {
        //   result = result?.[c];
        // });

        // if (!json?.products || json.products?.product?.length === 0)
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

        // const newData = new Product({
        //   name: "gourav",
        //   vendor: "642e99e719370f400ed7460e",
        // });

        // try {
        //   await newData.save();

        //   const langPromise = [];

        //   langPromise.concat(
        //     MasterDescription.insertMany(
        //       languages.map((lang) => ({
        //         languageCode: lang.code,
        //         shortDescription: " ",
        //         longDescription: " ",
        //         mainPage: newData._id,
        //         key: "productDesc",
        //       }))
        //     )
        //   );

        //   const featuresLang = [];
        //   const faqsLang = [];

        //   languages.forEach((lang) => {
        //     featuresLang.push({
        //       languageCode: lang.code,
        //       features: [],
        //       mainPage: newData._id,
        //       key: "productFeatures",
        //     });

        //     faqsLang.push({
        //       languageCode: lang.code,
        //       mainPage: newData._id,
        //       faqs: [],
        //       key: "productFaqs",
        //     });
        //   });

        //   langPromise.concat(MasterDescription.insertMany(featuresLang));

        //   langPromise.concat(MasterDescription.insertMany(faqsLang));

        //   await Promise.all(langPromise);
        // } catch (err) {
        //   console.log("err", err);
        // }

        res.status(200).json({
          status: true,
          // product: json.products.product[0],
          product: result[0],
          fileName,
          containers: resultObj ? resultObj.string.split(",") : containers,
        });
      });
    });

    response.pipe(localFile);
  });
};

exports.importCategoryCommonData = async (req, res, next) => {
  const { fields, fileName, containers, isXlsxFile } = req.body;

  const directoryPath = path.resolve(
    __dirname,
    "..",
    "uploads",
    "images",
    "product-files",
    fileName
  );

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

    let result;

    if (!isXlsxFile) {
      let json;

      try {
        json = parser.toJson(data);
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid xml link.",
          500
        );
        return next(error);
      }

      json = JSON.parse(json);

      result = JSON.parse(JSON.stringify(json));

      containers.forEach((c) => {
        result = result?.[c];
      });

      if (!result || (!Array.isArray(result) && typeof result !== "object")) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid link.",
          500
        );
        return next(error);
      }

      if (!Array.isArray(result)) {
        result = [result];
      }
    } else {
      try {
        workSheetsFromFile = xlsx.parse(
          `${__dirname}/../uploads/images/product-files/${fileName}`
        );
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong.",
          500
        );
        return next(error);
      }

      result = [];

      if (
        workSheetsFromFile &&
        workSheetsFromFile[0]?.data &&
        workSheetsFromFile[0].data[0]
      ) {
        const header = workSheetsFromFile[0].data[0];

        if (header && Array.isArray(header)) {
          for (let i = 1; i < workSheetsFromFile[0].data.length; i++) {
            const product = {};

            header.forEach((h, idx) => {
              if (helperObj[h]) {
                product[helperObj[h]] = workSheetsFromFile[0].data[i][idx];
              }
            });

            result.push(product);
          }
        }
      }

      if (result.length == 0) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please upload valid file.",
          500
        );
        return next(error);
      }
    }

    const commonFields = new Set();

    result.forEach((item) => {
      const categories = [];

      fields.forEach((field) => {
        categories.push(item[field]);
      });

      const category = categories.join(" > ");
      commonFields.add(category);
    });

    let categories = await getAllCategories();

    res.status(200).json({
      status: true,
      commonFields: [...commonFields],
      categories,
      fields,
    });
  });
};

exports.importCommonData = async (req, res, next) => {
  const { fields, fileName, containers, isXlsxFile } = req.body;

  const directoryPath = path.resolve(
    __dirname,
    "..",
    "uploads",
    "images",
    "product-files",
    fileName
  );

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

    let result;

    if (!isXlsxFile) {
      let json;

      try {
        json = parser.toJson(data);
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid xml link.",
          500
        );
        return next(error);
      }

      json = JSON.parse(json);

      result = JSON.parse(JSON.stringify(json));

      containers.forEach((c) => {
        result = result?.[c];
      });

      if (!result || (!Array.isArray(result) && typeof result !== "object")) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid link.",
          500
        );
        return next(error);
      }

      if (!Array.isArray(result)) {
        result = [result];
      }
    } else {
      try {
        workSheetsFromFile = xlsx.parse(
          `${__dirname}/../uploads/images/product-files/${fileName}`
        );
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong.",
          500
        );
        return next(error);
      }

      result = [];

      if (
        workSheetsFromFile &&
        workSheetsFromFile[0]?.data &&
        workSheetsFromFile[0].data[0]
      ) {
        const header = workSheetsFromFile[0].data[0];

        if (header && Array.isArray(header)) {
          for (let i = 1; i < workSheetsFromFile[0].data.length; i++) {
            const product = {};

            header.forEach((h, idx) => {
              if (helperObj[h]) {
                product[helperObj[h]] = workSheetsFromFile[0].data[i][idx];
              }
            });

            result.push(product);
          }
        }
      }

      if (result.length == 0) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please upload valid file.",
          500
        );
        return next(error);
      }
    }

    const labels = {
      brandId: "Brand",
      unitId: "Unit",
      buyingPriceCurrency: "Currency",
      shippingCompany: "Shipping Company",
    };

    const commonFields = [];
    const commonFieldValues = {};

    for (let k in fields) {
      if (Array.isArray(fields[k])) {
        fields[k].forEach((field, idx) => {
          const commonField = {
            key: k,
            xmlKey: field,
            label: `${labels[k]} ${idx + 1}`,
          };

          commonFieldValues[field] = new Set();
          commonFields.push(commonField);
        });
      } else {
        const commonField = {
          key: k,
          xmlKey: fields[k],
          label: labels[k],
        };

        commonFieldValues[fields[k]] = new Set();
        commonFields.push(commonField);
      }
    }

    result.forEach((item) => {
      for (let key in commonFieldValues) {
        commonFieldValues[key].add(item[key]);
      }
    });

    for (let key in commonFieldValues) {
      commonFieldValues[key] = [...commonFieldValues[key]];
    }

    commonFields.forEach((field) => {
      field["values"] = commonFieldValues[field["xmlKey"]];
    });

    let brands, units, currencies, shippingCompanies;

    if (fields["brandId"]) {
      brands = Brand.aggregate([
        {
          $match: {
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
    }

    if (fields["unitId"]) {
      units = Unit.aggregate([
        {
          $match: {
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
    }

    if (fields["buyingPriceCurrency"]) {
      currencies = Currency.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 0,
            label: "$code",
            value: "$_id",
          },
        },
      ]);
    }

    if (fields["shippingCompany"]) {
      shippingCompanies = ShippingCompany.aggregate([
        {
          $match: {
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
    }

    [brands, units, currencies, shippingCompanies] = await Promise.all([
      brands,
      units,
      currencies,
      shippingCompanies,
    ]);

    const dbFields = {
      brands: Array.isArray(brands)
        ? brands.concat({ label: "Other", value: "other" })
        : [],
      units: Array.isArray(units)
        ? units.concat({ label: "Other", value: "other" })
        : [],
      currencies: Array.isArray(currencies)
        ? currencies.concat({ label: "Other", value: "other" })
        : [],
      shippingCompanies: Array.isArray(shippingCompanies)
        ? shippingCompanies.concat({ label: "Other", value: "other" })
        : [],
    };

    res.status(200).json({ status: true, commonFields, dbFields });
  });
};

exports.importProducts = async (req, res, next) => {
  const {
    mappedObj,
    fileName,
    // vendor,
    containers,
    // subCategoriesKey,
    isXlsxFile,
    isAutoSync,
    syncTime,
    selectedSyncFields,
    fileLink,

    linkingData,
  } = req.body;

  let categoriesLinkedFields = [];
  let categoriesLinking = {};
  let commonLinkFields = {};
  let propertiesLinking = [];

  if (linkingData) {
    categoriesLinkedFields = linkingData.categoriesLinkedFields;
    categoriesLinking = linkingData.categoriesLinking;
    commonLinkFields = linkingData.commonLinkFields;
    propertiesLinking = linkingData.propertiesLinking;

    categoriesLinkedFields.unshift("masterCategoryId");
  }

  const vendorId = req.userId;

  /*
    mappedObj = {
      "ws_code": {
        "label": "Serial Number",
        "value": "serialNumber"
      },
    }
  */

  const directoryPath = path.resolve(
    __dirname,
    "..",
    "uploads",
    "images",
    "product-files",
    fileName
  );

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

    let result;

    if (!isXlsxFile) {
      let json;

      try {
        json = parser.toJson(data);
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid xml link.",
          500
        );
        return next(error);
      }

      json = JSON.parse(json);

      result = JSON.parse(JSON.stringify(json));

      containers.forEach((c) => {
        result = result?.[c];
      });

      if (!result || (!Array.isArray(result) && typeof result !== "object")) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please provide valid link.",
          500
        );
        return next(error);
      }

      if (!Array.isArray(result)) {
        result = [result];
      }
    } else {
      try {
        workSheetsFromFile = xlsx.parse(
          `${__dirname}/../uploads/images/product-files/${fileName}`
        );
      } catch (err) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong.",
          500
        );
        return next(error);
      }

      result = [];

      if (
        workSheetsFromFile &&
        workSheetsFromFile[0]?.data &&
        workSheetsFromFile[0].data[0]
      ) {
        const header = workSheetsFromFile[0].data[0];

        if (header && Array.isArray(header)) {
          for (let i = 1; i < workSheetsFromFile[0].data.length; i++) {
            const product = {};

            header.forEach((h, idx) => {
              if (helperObj[h]) {
                product[helperObj[h]] = workSheetsFromFile[0].data[i][idx];
              }
            });

            result.push(product);
          }
        }
      }

      if (result.length == 0) {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          "Please upload valid file.",
          500
        );
        return next(error);
      }
    }

    let productsJSON = result?.map((p) => ({ ...p, errors: "" }));
    let products = result;

    const keys = Object.keys(mappedObj);
    const mapKeys = {};

    /*  
      keys = ['ws_code']
      mapKeys = {serialNumber: 'ws_code'}
    */
    products = products.map((product, index) => {
      const objToReturn = {
        id: index,
        errors: "",
      };

      keys.forEach((key) => {
        if (key !== "subCategoryId") {
          let obj = mappedObj[key];

          if (obj.value === "subCategoryId") {
            // const sc = mappedObj["subCategoryId"];
            // const scObj = sc[key];

            // if (scObj.value > 0) {
            // obj.value = `subCategoryId-${scObj.value}`;
            // }
            obj.value = key;
          }

          mapKeys[obj.value] = key;
          objToReturn[obj.value] =
            typeof product[key] === "object" && obj.value !== "media"
              ? ""
              : product[key];
        }
      });

      return objToReturn;
    });

    products = products
      .map((product) => {
        const categories = [];

        categoriesLinkedFields.forEach((field) => {
          categories.push(product[field]);
        });

        const category = categories.join(" > ");

        product.masterCategoryId = categoriesLinking[category];

        for (let key in commonLinkFields) {
          const item = propertiesLinking.find((linking) => linking.key === key);

          const { values } = item;

          if (values[product[key]] !== "add") {
            product[key] = values[product[key]];
          }
        }

        return product;
      })
      .filter((product) => {
        for (let key in commonLinkFields) {
          if (product[key] == "delete") {
            return false;
          }
        }
        return true;
      });

    //uncommon barcodes
    let barcodes = products.map((p) => p.barCode);
    let uncommonBarcodes = [...new Set(products)];

    if (uncommonBarcodes.size !== barcodes.length) {
      //to do
    }

    let onlyCopyids = await Product.aggregate([
      {
        $match: {
          barCode: {
            $in: barcodes,
          },
          isDeleted: false,
        },
      },
      {
        $project: {
          _id: 1,
          barCode: 1,
        },
      },
    ]);

    const barCodesAvailable = onlyCopyids.map((a) => a.barCode);

    //remove product from 'products' whose barCode is available.

    if (barCodesAvailable.length > 0) {
      products = products.filter((p) => {
        if (barCodesAvailable.includes(p.barCode)) {
          return false;
        }
        return true;
      });
    }

    onlyCopyids = onlyCopyids.map((a) => a._id.toString());

    if (onlyCopyids.length > 0 && !req.isAdmin) {
      let isAlreadyAdded = await VendorProduct.aggregate([
        {
          $match: {
            vendorId: new ObjectId(vendorId),
            productId: {
              $in: onlyCopyids.map((id) => ObjectId(id)),
            },
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 0,
            productId: 1,
          },
        },
      ]);

      isAlreadyAdded = isAlreadyAdded.map((p) => p.productId.toString());

      if (isAlreadyAdded.length > 0) {
        onlyCopyids = onlyCopyids.filter((id) => !isAlreadyAdded.includes(id));
      }
    }

    // let vendorData, allWarehouses;

    // try {
    // vendorData = Vendor.findById(vendor).select("businessCountry").lean();
    // allWarehouses = Warehouse.find({
    //   vendor: ObjectId(vendor),
    //   isDeleted: false,
    // })
    //   .select("_id")
    //   .lean();
    // [vendorData, allWarehouses] = await Promise.all([
    //   vendorData,
    //   allWarehouses,
    // ]);
    // } catch (err) {
    //   console.log("vendor err", err);
    //   return;
    // }

    const existInDbArr = [
      //removed due to categories linking
      // {
      //   value: "masterCategoryId",
      //   model: ProductCategory,
      //   searchIn: "name",
      // },
      {
        value: "unitId",
        model: Unit,
        searchIn: "name",
      },
      {
        value: "brandId",
        model: Brand,
        searchIn: "name",
      },
      {
        value: "buyingPriceCurrency",
        model: Currency,
        searchIn: "sign",
      },
      //removed due to multiple levels in sub categories
      // {
      //   value: "subCategoryId",
      //   model: SubProductCategory,
      // },
    ];

    // if (subCategoriesKey.length > 1) {
    // new Array(subCategoriesKey.length - 1).fill(0).forEach((_, idx) => {
    //   existInDbArr.push({
    //     value: `subCategoryId-${idx + 1}`,
    //     model: Category,
    //   });
    // });
    // }

    //message = "Please enter digits only."
    //pattern = /^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/
    const digitsKeys = [
      "height",
      "weight",
      "width",
      "length",
      // "quantity",
      "buyingPrice",
      // "dc",
      // "shippingCompany",
    ];

    //message = "Price can only contain numbers."
    //pattern = /^\d{1,3}(,\d{3})*(\,|.\d+)?$/i
    // const numberKeys = ["buyingPrice"];
    const numberKeys = [];

    let isError = false;

    for (let i = 0; i < digitsKeys.length; i++) {
      if (!mapKeys[digitsKeys[i]]) {
        continue;
      }

      products.forEach((product) => {
        const value = product[digitsKeys[i]];

        if (!/^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/.test(+value)) {
          isError = true;
          // products[product.id].errors[digitsKeys[i]] = `${
          //   mapKeys[digitsKeys[i]]
          // } = Please enter digits only`;

          productsJSON[product.id].errors += `${
            mapKeys[digitsKeys[i]]
          }:  Please enter digits only. `;
        }
      });
    }

    for (let i = 0; i < numberKeys.length; i++) {
      if (!mapKeys[numberKeys[i]]) {
        continue;
      }

      products.forEach((product) => {
        const value = product[numberKeys[i]];

        if (!/^\d{1,3}(,\d{3})*(\,|.\d+)?$/i.test(+value)) {
          isError = true;
          // products[product.id].errors[numberKeys[i]] = `${
          //   mapKeys[numberKeys[i]]
          // } = Please enter digits only`;

          productsJSON[product.id].errors += `${
            mapKeys[numberKeys[i]]
          }:  Please enter digits only. `;
        }
      });
    }

    if (isError) {
      //create excel file

      return res.status(200).json({
        status: false,
        message: "Import failed",
        products: productsJSON,
      });
    }

    const usedCategories = [];

    for (let i = 0; i < existInDbArr.length; i++) {
      const existInDb = existInDbArr[i];

      if (!mapKeys[existInDb.value]) {
        continue;
      }

      const allData = {};

      products.forEach((product) => {
        const value = product[existInDb.value];

        if (!ObjectId.isValid(value)) {
          //added above condition after linking
          if (allData[value]) {
            allData[value] = [...allData[value], product.id];
          } else {
            allData[value] = [product.id];
          }
        }
      });

      const values = Object.keys(allData);

      for (let j = 0; j < values.length; j++) {
        const findObj = {};

        /*
        switch (existInDb.value) {
          case "subCategoryId":
            {
              findObj.productCategoryId =
                products[allData[values[j]][0]].masterCategoryId;
            }
            break;
          default: {
            if (existInDb.value.includes("subCategoryId")) {
              const scId = +existInDb.value.split("-")[1];

              let parentId;
              if (scId === 1) {
                //subCategoryId
                parentId = products[allData[values[j]][0]].subCategoryId;
              } else {
                //subCategoryId-${scId - 1}
                parentId =
                  products[allData[values[j]][0]][`subCategoryId-${scId - 1}`];
              }

              findObj.parentId = parentId;
            }
          }
        }
        */

        const isExist = await existInDb.model
          .findOne({
            [existInDb.searchIn]: values[j],
            isDeleted: false,
            ...findObj,
          })
          .select("_id")
          .lean();

        //added false condition after linking
        if (false && isExist) {
          allData[values[j]].forEach((id) => {
            // products[id][existInDb.value] = isExist._id;
            const idx = products.findIndex((p) => p.id == id);
            products[idx][existInDb.value] = isExist._id;
          });

          //if brand is new and subCategory is old
          if (
            existInDb.value === "subCategoryId" &&
            products[allData[values[j]][0]].isNewBrand
          ) {
            // await SubProductCategory.findByIdAndUpdate(isExist._id, {
            //   $push: {
            //     brands: products[allData[values[j]][0]].brandId,
            //   },
            // });
          }

          if (existInDb.value === "masterCategoryId") {
            usedCategories.push(isExist._id);
          }
        } else {
          let insertedId;

          try {
            switch (existInDb.value) {
              case "masterCategoryId":
                {
                  const [sortData] = await ProductCategory.aggregate(
                    LOOKUP_ORDER({})
                  );

                  let nextOrder;

                  if (!sortData) {
                    nextOrder = 1;
                  } else {
                    nextOrder = sortData.order + 1;
                  }

                  const newProductCategory = new ProductCategory({
                    name: values[j],
                    order: nextOrder,
                    // country: [vendorData.businessCountry],
                  });

                  const promises = [newProductCategory.save()];

                  for (let i = 0; i < languages.length; i++) {
                    const code = languages[i].code;

                    let obj = new ProductCategoryDescriptions({
                      languageCode: code,
                      name: `${values[j]} ${code !== "en" ? code : ""}`,
                      productCategoryId: newProductCategory._id,
                    });

                    promises.push(obj.save());
                  }

                  await Promise.all(promises);

                  // await ProductCategoryDescriptions.insertMany(
                  //   languages.map((lang) => ({
                  //     languageCode: lang.code,
                  //     name: values[j],
                  //     productCategoryId: newProductCategory._id,
                  //   }))
                  // );

                  insertedId = newProductCategory._id;

                  usedCategories.push(newProductCategory._id);
                }
                break;
              case "subCategoryId":
                {
                  const productCategoryId =
                    products[allData[values[j]][0]].masterCategoryId;

                  const brandId = products[allData[values[j]][0]].brandId;

                  // const newSubProductCategory = new SubProductCategory({
                  //   name: values[j],
                  //   productCategoryId,
                  //   brands: [brandId],
                  // });

                  await newSubProductCategory.save();

                  // await SubProductCategoryDescriptions.insertMany(
                  //   languages.map((lang) => ({
                  //     languageCode: lang.code,
                  //     name: lang.default ? values[j] : "",
                  //     productCategoryId,
                  //     subProductCategoryId: newSubProductCategory._id,
                  //   }))
                  // );

                  insertedId = newSubProductCategory._id;
                }
                break;
              case "unitId":
                {
                  const newUnit = new Unit({
                    name: values[j],
                  });

                  await newUnit.save();
                  const promises = [];

                  for (let i = 0; i < languages.length; i++) {
                    const code = languages[i].code;

                    let obj = new MasterDescription({
                      languageCode: code,
                      name: `${values[j]} ${code !== "en" ? code : ""}`,
                      mainPage: newUnit._id,
                      key: "unit",
                    });

                    promises.push(obj.save());
                  }

                  await Promise.all(promises);

                  insertedId = newUnit._id;
                }
                break;
              case "brandId":
                {
                  const newBrand = new Brand({
                    name: values[j],
                  });

                  await newBrand.save();
                  const promises = [];

                  for (let i = 0; i < languages.length; i++) {
                    const code = languages[i].code;

                    let obj = new MasterDescription({
                      languageCode: code,
                      name: `${values[j]} ${code !== "en" ? code : ""}`,
                      mainPage: newBrand._id,
                      key: "brand",
                      slug: `${newBrand._id.toString()}-${code}`,
                    });

                    promises.push(obj.save());
                  }

                  await Promise.all(promises);

                  insertedId = newBrand._id;

                  // allData[values[j]].forEach((id) => {
                  //   products[id]["isNewBrand"] = true;
                  // });
                }
                break;
              case "buyingPriceCurrency":
                {
                  const newCurrency = new Currency({
                    name: values[j],
                    code: values[j],
                    sign: values[j],
                    exchangeType: "Fixed",
                    exchangeRate: 1,
                  });

                  await newCurrency.save();

                  const promises = [];

                  for (let i = 0; i < languages.length; i++) {
                    const code = languages[i].code;

                    let obj = new MasterDescription({
                      languageCode: code,
                      name: `${values[j]} ${code !== "en" ? code : ""}`,
                      mainPage: newCurrency._id,
                      key: "currency",
                    });

                    promises.push(obj.save());
                  }

                  await Promise.all(promises);

                  insertedId = newCurrency._id;

                  // allData[values[j]].forEach((id) => {
                  //   products[id]["isNewBrand"] = true;
                  // });
                }
                break;
              default: {
                const scId = +existInDb.value.split("-")[1];

                let parentId;
                if (scId === 1) {
                  //subCategoryId
                  parentId = products[allData[values[j]][0]].subCategoryId;
                } else {
                  //subCategoryId-${scId - 1}
                  parentId =
                    products[allData[values[j]][0]][
                      `subCategoryId-${scId - 1}`
                    ];
                }

                // const newCategory = new Category({
                //   name: values[j],
                //   parentId,
                // });

                await newCategory.save();

                insertedId = newCategory._id;
              }
            }
          } catch (err) {
            console.log("err insertion sub", err);
          }

          if (insertedId) {
            allData[values[j]].forEach((id) => {
              // products[id][existInDb.value] = insertedId;
              const idx = products.findIndex((p) => p.id == id);
              products[idx][existInDb.value] = insertedId;
            });
          }

          // isError = true;
          // allData[values[j]].forEach((id) => {
          //   productsJSON[id].errors += `${
          //     mapKeys[existInDb.value]
          //   } doesn't exist. `;
          // });
        }
      }
    }

    let originalCategoryId = "masterCategoryId";

    //added false due to categories linking
    if (false && keys.includes("subCategoryId")) {
      let subCategoryKeys = Object.keys(mappedObj.subCategoryId);

      if (subCategoryKeys.length > 0) {
        let arrChanged = subCategoryKeys.map((s) => ({
          key: s,
          value: mappedObj.subCategoryId[s].value,
        }));

        arrChanged = arrChanged.sort((a, b) => a.value - b.value);

        for (let i = 0; i < arrChanged.length; i++) {
          const key = arrChanged[i].key;
          originalCategoryId = key;

          for (let k = 0; k < products.length; k++) {
            const product = products[k];

            const value = product[key];

            let parent;

            if (i == 0) {
              parent = product.masterCategoryId;
            } else {
              parent = product[arrChanged[i - 1].key];
            }

            const isExist = await ProductCategory.findOne({
              name: value,
              parentId: ObjectId(parent),
              isDeleted: false,
            })
              .select("_id")
              .lean();

            if (isExist) {
              product[key] = isExist._id;
            } else {
              const [sortData] = await ProductCategory.aggregate(
                LOOKUP_ORDER({ parentId: ObjectId(parent) })
              );

              let nextOrder;

              if (!sortData) {
                nextOrder = 1;
              } else {
                nextOrder = sortData.order + 1;
              }

              const newProductCategory = new ProductCategory({
                name: value,
                order: nextOrder,
                parentId: ObjectId(parent),
              });

              const promises = [newProductCategory.save()];

              for (let i = 0; i < languages.length; i++) {
                const code = languages[i].code;

                let obj = new ProductCategoryDescriptions({
                  languageCode: code,
                  name: `${value} ${code !== "en" ? code : ""}`,
                  productCategoryId: newProductCategory._id,
                });

                promises.push(obj.save());
              }

              await Promise.all(promises);

              product[key] = newProductCategory._id;
            }
          }
        }
      }
    }

    if (keys.includes("alternate_products")) {
      for (let i = 0; i < products.length; i++) {
        const ap = products[i].alternateProducts
          .split(",")
          .map((p) => p.trim());

        if (ap.length > 0) {
          const addedProducts = await ProductDescription.find({
            name: {
              $in: ap,
            },
          })
            .select("productId")
            .lean();

          if (addedProducts.length > 0) {
            products[i].alternateProducts = addedProducts.map(
              (product) => product.productId
            );
          } else {
            delete products[i].alternateProducts;
          }
        } else {
          delete products[i].alternateProducts;
        }
      }
    }

    {
      //create data

      addFile(fileName, products.length + 1, 0);

      res.status(200).json({
        status: true,
        message: "Product import started successfully.",
        total: products.length + 1,
        current: 0,
        fileName,
      });

      try {
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          // const categoriesId = [];

          // if (subCategoriesKey.length > 1) {
          //   new Array(subCategoriesKey.length - 1).fill(0).forEach((_, idx) => {
          //     categoriesId.push(product[`subCategoryId-${idx + 1}`]);
          //   });
          // }

          if (product.media) {
            if (!isXlsxFile && !Array.isArray(product.media.img_item)) {
              let media = product.media.img_item;
              const mediaUrl = await mediaDownloadHandler(media);

              product.media = [
                {
                  src: `uploads/images/product/${mediaUrl}`,
                  // isFeatured: true,
                  isImage: true,
                },
              ];

              product.coverImage = `uploads/images/product/${mediaUrl}`;
            } else {
              let medias;

              if (isXlsxFile) {
                medias = product.media.split(",").map((m) => m.trim());
              } else {
                medias = product.media.img_item;
              }

              const mediaUrls = [];
              for (let j = 0; j < medias.length; j++) {
                const media = await mediaDownloadHandler(medias[j]);
                mediaUrls.push(media);
              }

              product.media = mediaUrls.map((mediaUrl, idx) => ({
                src: `uploads/images/product/${mediaUrl}`,
                // isFeatured: idx === 0,
                isImage: true,
              }));

              product.coverImage = product.media[0]?.src;
            }
          }

          const newProduct = new Product({
            featureTitle: "Features",
            height: 0,
            weight: 0,
            width: 0,
            length: 0,
            ...product,
            categoryId: product[originalCategoryId],
            // categoriesId,
            // vendor: ObjectId("64217a9c95bc6db2b9de75c4"),
            // vendor: ObjectId(vendor),
            // warehouses: allWarehouses.map((w) => w._id),
            // prices: [
            //   {
            //     countryId: vendorData.businessCountry,
            //     sellingPrice: product.buyingPrice,
            //     discountPrice: product.buyingPrice,
            //   },
            // ],
            // countries: [vendorData.businessCountry],
            // isActive: true,
            isPublished: false,
            isApproved: req.isAdmin,
            // isPublished: req.isAdmin,
          });

          await newProduct.save();

          onlyCopyids.push(newProduct._id);

          const langPromise = [];

          const valueHandler = (code, key, temp = " ") => {
            return code == "en"
              ? product[key] ?? temp
              : product[`${key}_${code}`] ?? temp;
          };

          for (let i = 0; i < languages.length; i++) {
            let code = languages[i].code;

            obj = new ProductDescription({
              productId: newProduct._id,
              languageCode: code,
              name: valueHandler(code, "name"),
              shortDescription: valueHandler(code, "shortDescription"),
              longDescription: valueHandler(code, "longDescription"),
              slug: valueHandler(code, "slug", null),
              metaData: {
                title: valueHandler(code, "metaDataTitle"),
                description: valueHandler(code, "metaDataDescription"),
                author: valueHandler(code, "metaDataAuthor"),
                keywords: valueHandler(code, "metaDataKeywords"),
              },
              slug: `${newProduct._id.toString()}_${code}`,
            });

            langPromise.push(obj.save());
          }

          // langPromise.concat(
          //   MasterDescription.insertMany(
          //     languages.map((lang) => ({
          //       languageCode: lang.code,
          //       shortDescription: " ",
          //       longDescription: " ",
          //       mainPage: newProduct._id,
          //       key: "productDesc",
          //     }))
          //   )
          // );

          // const featuresLang = [];
          // const faqsLang = [];

          // languages.forEach((lang) => {
          //   featuresLang.push({
          //     languageCode: lang.code,
          //     features: [],
          //     mainPage: newProduct._id,
          //     key: "productFeatures",
          //   });

          //   faqsLang.push({
          //     languageCode: lang.code,
          //     mainPage: newProduct._id,
          //     faqs: [],
          //     key: "productFaqs",
          //   });
          // });

          // langPromise.concat(MasterDescription.insertMany(featuresLang));

          // langPromise.concat(MasterDescription.insertMany(faqsLang));

          await Promise.all(langPromise);

          updateFile(fileName, i + 1);
        }

        if (isAutoSync && !isXlsxFile) {
          const newSync = new ProductSync({
            link: fileLink,
            containers,
            mappedObj,
            hours: syncTime,
            fieldsToSync: selectedSyncFields,
            lastSyncedAt: new Date(),
            isAdmin: true,
          });

          await newSync.save();
        }

        //onlyCopyids

        if (onlyCopyids.length > 0 && !req.isAdmin) {
          const promises = [];

          const productsToInsert = await Product.aggregate([
            {
              $match: {
                _id: {
                  $in: onlyCopyids.map((id) => ObjectId(id)),
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

          for (let i = 0; i < productsToInsert.length; i++) {
            const product = productsToInsert[i];

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

          await Promise.all(promises);
        }
        updateFile(fileName, products.length + 1);

        // const firstVendorPromise = Vendor.findByIdAndUpdate(vendor, {
        //   $addToSet: {
        //     serveCountries: vendorData.businessCountry,
        //   },
        // });

        // let secondVendorPromise;

        // if (usedCategories.length > 0) {
        //   secondVendorPromise = Vendor.findByIdAndUpdate(vendor, {
        //     $addToSet: {
        //       productCategories: {
        //         $each: usedCategories,
        //       },
        //     },
        //   });
        // }

        // await Promise.all([firstVendorPromise, secondVendorPromise]);
      } catch (err) {
        console.log("err", err);
        // const error = new HttpError(
        //   req,
        //   new Error().stack.split("at ")[1].trim(),
        //   "Could not import products",
        //   500
        // );
        // return next(error);
      }
    }

    // const newData = new Product({
    //   name: "gourav",
    //   vendor: "642e99e719370f400ed7460e",
    // });

    // try {
    //   await newData.save();

    //   const langPromise = [];

    //   langPromise.concat(
    //     MasterDescription.insertMany(
    //       languages.map((lang) => ({
    //         languageCode: lang.code,
    //         shortDescription: " ",
    //         longDescription: " ",
    //         mainPage: newData._id,
    //         key: "productDesc",
    //       }))
    //     )
    //   );

    //   const featuresLang = [];
    //   const faqsLang = [];

    //   languages.forEach((lang) => {
    //     featuresLang.push({
    //       languageCode: lang.code,
    //       features: [],
    //       mainPage: newData._id,
    //       key: "productFeatures",
    //     });

    //     faqsLang.push({
    //       languageCode: lang.code,
    //       mainPage: newData._id,
    //       faqs: [],
    //       key: "productFaqs",
    //     });
    //   });

    //   langPromise.concat(MasterDescription.insertMany(featuresLang));

    //   langPromise.concat(MasterDescription.insertMany(faqsLang));

    //   await Promise.all(langPromise);
    // } catch (err) {
    //   console.log("err", err);
    // }

    // res.status(200).json({
    //   status: true,
    //   message: "Product imported successfully.",
    // });
  });
};

// exports.importProductsCheck = (req, res, next) => {
//   const { fileName } = req.body;

//   addFile(fileName, 10, 0);

//   let i = 0;

//   const timer = setInterval(() => {
//     updateFile(fileName, i + 1);
//     i++;
//     if (i === 10) {
//       clearInterval(timer);
//     }
//   }, 1000);

//   res.status(200).json({
//     status: true,
//     message: "Product import started successfully.",
//     total: 10,
//     current: 0,
//     fileName,
//   });
// };

exports.importProductStatus = (req, res, next) => {
  const { fileName } = req.body;
  const importStatus = getFile(fileName);

  if (importStatus) {
    if (importStatus.total === importStatus.current) {
      removeFile(fileName);
    }
  }

  res.status(200).json({
    status: true,
    message: "Product status fetched successfully.",
    importStatus,
  });
};

exports.barCodeValidation = async (req, res, next) => {
  const { barCode } = req.body;

  let isExist;
  try {
    isExist = await Product.findOne({ barCode, isDeleted: false }).lean();
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
    status: !!isExist,
    message: "Bar Code validation checked successfully.",
  });
};

exports.importXlsFile = async (req, res, next) => {
  let workSheetsFromFile;

  let file;
  if (req.file) {
    file = req.file.path;
  } else {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Xlsx file is required",
      422
    );
    return next(error);
  }

  try {
    workSheetsFromFile = xlsx.parse(`${__dirname}/../${file}`);
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

  const product = {};

  if (
    workSheetsFromFile &&
    workSheetsFromFile[0]?.data &&
    workSheetsFromFile[0].data[0]
  ) {
    const header = workSheetsFromFile[0].data[0];

    if (header && Array.isArray(header)) {
      const firstProduct = workSheetsFromFile[0].data[1];

      header.forEach((h, idx) => {
        if (helperObj[h]) {
          product[helperObj[h]] = firstProduct[idx];
        }
      });
    }
  }

  res.status(200).json({
    status: true,
    data: workSheetsFromFile,
    product,
    isXlsx: true,
    fileName: req.file.filename,
    containers: [],
  });
};

exports.inventorySearch = async (req, res, next) => {
  const { key = "barCode", value } = req.query;

  let products;

  try {
    products = await Product.aggregate([
      {
        $match: {
          isDeleted: false,
          isApproved: true,
          // barCode: new RegExp("(?:)", "i"),
          // name: new RegExp("(?:)"),
          [key]: new RegExp(value, "i"),
        },
      },
      {
        $project: {
          barCode: 1,
          name: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not able to fetch products.",
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

exports.getAllProducts = async (req, res, next) => {
  const { name } = req.query;
  let products;
  try {
    products = await Product.aggregate([
      {
        $match: {
          name: new RegExp(name, "i"),
          isDeleted: false,
          isApproved: true,
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
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetched products",
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Product's fetched successfully.",
    products,
  });
};

exports.slugValidation = async (req, res, next) => {
  const { slug, id, languageCode } = req.body;

  const searchObj = { slug };

  if (id) {
    searchObj["$or"] = [
      {
        $and: [
          {
            productId: {
              $ne: ObjectId(id),
            },
          },
          {
            languageCode: {
              $in: ["en", "ar", "tr"],
            },
          },
        ],
      },
      {
        $and: [
          {
            productId: {
              $eq: ObjectId(id),
            },
          },
          {
            languageCode: {
              $ne: languageCode,
            },
          },
        ],
      },
    ];
  }

  let data;

  try {
    data = await ProductDescription.findOne(searchObj);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not validate slug.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's slug validated successfully.",
    isSlugExist: !!data,
    languageCode,
  });
};

exports.productNameValidation = async (req, res, next) => {
  const { name, languageCode } = req.body;

  const searchObj = { name, languageCode };

  let data;

  try {
    data = await ProductDescription.findOne(searchObj);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not validate product name.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Product's name validated successfully.",
    isProductNameExist: !!data,
    languageCode,
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
