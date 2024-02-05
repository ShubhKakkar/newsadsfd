const Vendor = require("../models/vendor");
const Country = require("../models/country");
const City = require("../models/city");
const MasterDescription = require("../models/masterDescription");
const SubSpecificationGroupValue = require("../models/subSpecificationGroupValue");
const SubSpecificationGroupValueDescription = require("../models/subSpecificationGroupValueDescription");
const Category = require("../models/productCategory");
const Brand = require("../models/brand");
const Unit = require("../models/unit");
const Product = require("../models/product");
const ProductDescription = require("../models/productDescription");
const Currency = require("../models/currency");

const country = require("../country.json");
const { languages } = require("./helper");

const axios = require("axios");
const fs = require("fs").promises;
const util = require("util");
const products = require("../data/product.json");
const idCreator = require("../utils/idCreator");

const vendorIBANumberHelper = async (iba, id) => {
  let ibaFound = false;
  let ibaUpdated = iba;
  let sliceNumber = -2;

  {
    const randomstring = Math.random().toString(36).slice(sliceNumber);
    ibaUpdated += randomstring;
  }

  while (!ibaFound) {
    try {
      const vendor = await Vendor.findOne({ ibaNumber: ibaUpdated })
        .select("_id")
        .lean();

      if (!vendor) {
        ibaFound = true;
        await Vendor.findByIdAndUpdate(id, {
          $set: {
            ibaNumber: ibaUpdated,
          },
        });
      } else {
        const randomstring = Math.random().toString(36).slice(sliceNumber);
        sliceNumber -= 1;

        ibaUpdated += randomstring;
      }
    } catch (err) {
      console.log("vendorIBA err", err);
      return;
    }
  }
};

const vendorIBANumberFix = async () => {
  const allSameIBAVendors = await Vendor.aggregate([
    {
      $project: {
        ibaNumber: 1,
      },
    },
    {
      $group: {
        _id: "$ibaNumber",
        vendors: {
          $push: "$_id",
        },
      },
    },
    {
      $addFields: {
        idSize: {
          $size: "$vendors",
        },
      },
    },
    {
      $match: {
        idSize: {
          $gt: 1,
        },
      },
    },
  ]);

  for (let i = 0; i < allSameIBAVendors.length; i++) {
    const iba = allSameIBAVendors[i]._id;
    const vendors = allSameIBAVendors[i].vendors;

    for (let j = 0; j < vendors.length; j++) {
      const vendor = vendors[j];

      await vendorIBANumberHelper(iba, vendor);
    }
  }
};

const updateCountry = async () => {
  let countryMasterDescriptions = [];
  let cityMasterDescriptions = [];

  for (let key in country) {
    console.log("country inserting =>", key);

    let newCountry = new Country({
      name: key,
    });

    let isError = false;

    try {
      await newCountry.save();

      countryMasterDescriptions = countryMasterDescriptions.concat(
        languages.map((lang) => ({
          mainPage: newCountry._id,
          key: "country",
          languageCode: lang.code,
          name: lang.code == "en" ? key : "",
        }))
      );
    } catch (err) {
      console.log("err 1", err);
      isError = true;
    }

    if (!isError) {
      const cities = country[key];

      let operationRes;

      try {
        operationRes = await City.bulkWrite(
          cities.map((city) => ({
            insertOne: {
              document: { name: city, parentId: newCountry._id },
            },
          }))
        );
      } catch (err) {
        console.log("err 2", err);
        isError = true;
      }

      if (!isError) {
        for (let i = 0; i < cities.length; i++) {
          const city = cities[i];
          const id = operationRes.insertedIds[i.toString()];

          cityMasterDescriptions = cityMasterDescriptions.concat(
            languages.map((lang) => ({
              key: "city",
              languageCode: lang.code,
              mainPage: id,
              name: lang.code == "en" ? city : "",
            }))
          );
        }
      } else {
        console.log("err city inserting =>", key);
      }
    } else {
      console.log("err country inserting =>", key);
    }
  }

  try {
    await MasterDescription.bulkWrite(
      countryMasterDescriptions.map((obj) => ({
        insertOne: {
          document: obj,
        },
      }))
    );

    await MasterDescription.bulkWrite(
      cityMasterDescriptions.map((obj) => ({
        insertOne: {
          document: obj,
        },
      }))
    );
  } catch (err) {
    console.log("err 3", err);
  }
};

const updateSpecification = async () => {
  const heights = [];
  let descriptions = [];

  for (let i = 1; i <= 1000; i++) {
    heights.push(i);
  }

  let operationRes, isError;

  try {
    operationRes = await SubSpecificationGroupValue.bulkWrite(
      heights.map((height) => ({
        insertOne: {
          document: {
            name: `${height} cm`,
            subSpecificationId: "655cabad731d15f80a774b1f",
          },
        },
      }))
    );
  } catch (err) {
    console.log("err 1", err);
    isError = true;
  }

  if (!isError) {
    for (let i = 1; i <= 1000; i++) {
      const insertedId = (i - 1).toString();
      const id = operationRes.insertedIds[insertedId];

      descriptions = descriptions.concat(
        languages.map((lang) => ({
          subSpecificationGroupValueId: id,
          name: ["en", "tr"].includes(lang.code) ? `${i} cm` : `${i} سم`,
          languageCode: lang.code,
        }))
      );
    }

    try {
      await SubSpecificationGroupValueDescription.bulkWrite(
        descriptions.map((obj) => ({
          insertOne: {
            document: obj,
          },
        }))
      );
    } catch (err) {
      console.log("err 2", err);
    }
  }
};

const updateSpecificationWeight = async () => {
  const weights = [];
  let descriptions = [];

  for (let i = 1; i <= 15000; i++) {
    let n = i;
    if (n < 1000) {
      weights.push(`${n} gm`);
    } else if (n % 1000 == 0) {
      weights.push(`${n / 1000} kg`);
    } else {
      weights.push(`${n / 1000} kg`);
    }
  }

  let operationRes, isError;

  try {
    operationRes = await SubSpecificationGroupValue.bulkWrite(
      weights.map((weight) => ({
        insertOne: {
          document: {
            name: weight,
            subSpecificationId: "655cab98731d15f80a774b0f",
          },
        },
      }))
    );
  } catch (err) {
    console.log("err 1", err);
    isError = true;
  }

  if (!isError) {
    for (let i = 1; i <= 15000; i++) {
      const insertedId = (i - 1).toString();
      const id = operationRes.insertedIds[insertedId];

      let name = "";
      let nameAr = "";

      {
        let n = i;
        if (n < 1000) {
          name = `${n} gm`;
          nameAr = `${n} جم`;
        } else {
          name = `${n / 1000} kg`;
          nameAr = `${n / 1000} كلغ`;
        }
      }

      descriptions = descriptions.concat(
        languages.map((lang) => ({
          subSpecificationGroupValueId: id,
          name: ["en", "tr"].includes(lang.code) ? name : nameAr,
          languageCode: lang.code,
        }))
      );
    }

    try {
      await SubSpecificationGroupValueDescription.bulkWrite(
        descriptions.map((obj) => ({
          insertOne: {
            document: obj,
          },
        }))
      );
    } catch (err) {
      console.log("err 2", err);
    }
  }
};

const updateProducts = async () => {
  try {
    for (const product of products) {
      try {
        let coverImage;
        const downloadedImages = await Promise.all(
          product.ImageUrls.map(async (image, index) => {
            try {
              const response = await axios.get(image.ImageUrl, {
                responseType: "arraybuffer",
              });
              const imageName = `product_${index + 1}.jpg`;
              const imagePath = `uploads/images/product/${imageName}`;

              const imageTarget = image.ImageUrl.split(
                "https://www.noonmar.com/Data/"
              )[1]
                .split(".png")[0]
                .split(".jpg")[0];

              await fs.writeFile(imagePath, response.data, "binary");

              if (
                imageTarget ===
                image.ImageUrl.split("https://www.noonmar.com/Data/")[1]
                  .split(".png")[0]
                  .split(".jpg")[0]
              ) {
                coverImage = `uploads/images/product/${imageName}`;
              }

              return {
                src: `uploads/images/product/${imageName}`,
                isImage: true,
              };
            } catch (downloadError) {
              console.error(
                `Error downloading image for product ${product.ProductId}:`,
                downloadError
              );
              return null;
            }
          })
        );

        const validImages = downloadedImages.filter((image) => image !== null);

        const mainCategory =
          product.Categories[product.Categories.length - 1].CategoryId;

        const [category, brand, unit, currency] = await Promise.all([
          Category.findOne({ categoryId: mainCategory }),
          Brand.findOne({ name: product.Brand }),
          Unit.findOne({ name: product.StockUnit }),
          Currency.findOne({ code: product.Currency }),
        ]);

        const categoryId = category?._id;
        const brandId = brand?._id;
        const unitId = unit?._id;
        const currencyId = currency?._id;

        const notFixedDetails = {};

        if (product.Length) {
          notFixedDetails["length"] = Number(product.Length || 0);
        }

        const customId = await idCreator("product", false);

        const checkExistingProduct = await Product.findOne({
          productId: product.ProductId,
        });

        if (checkExistingProduct) {
          const savedProduct = await Product.findOneAndUpdate(
            { productId: product.ProductId },
            {
              name: product.ProductName || " ",
              barCode: product.BarCode || " ",
              hsCode: product.HsCode || " ",
              customId: customId,
              categoryId: categoryId,
              brandId: brandId,
              unitId: unitId,
              buyingPrice: Number(product.BuyingPrice),
              sellingPrice: Number(product.SellingPrice),
              featureTitle: product.ProductName,
              height: Number(product.Height),
              weight: Number(product.Weight),
              width: Number(product.Width),
              media: validImages,
              coverImage: coverImage,
              buyingPriceCurrency: currencyId,
              productId: product.ProductId,
              isPublished: true,
              ...notFixedDetails,
            },
            {
              new: true,
              upsert: true,
            }
          );
          await ProductDescription.findOneAndUpdate(
            { productId: savedProduct._id },
            {
              productId: savedProduct._id,
              languageCode: code,
              name: savedProduct.name,
              slug: savedProduct.name + code,
              longDescription: product.Details,
              shortDescription: product.shortDescription,
              metaData: {
                title: product.SeotTitle,
                author: " ",
                description: product.SeoDescription,
                keywords: product.SeoKeywords,
              },
            }
          );
        } else {
          const newProduct = new Product({
            name: product.ProductName || " ",
            barCode: product.BarCode || " ",
            hsCode: product.HsCode || " ",
            customId: customId,
            categoryId: categoryId,
            brandId: brandId,
            unitId: unitId,
            buyingPrice: Number(product.BuyingPrice),
            sellingPrice: Number(product.SellingPrice),
            featureTitle: product.ProductName,
            height: Number(product.Height),
            weight: Number(product.Weight),
            width: Number(product.Width),
            media: validImages,
            coverImage: coverImage,
            buyingPriceCurrency: currencyId,
            productId: product.ProductId,
            isPublished: true,
            ...notFixedDetails,
          });

          const savedProduct = await newProduct.save();

          const languageCodes = ["en", "ar", "tr"];

          await Promise.all(
            languageCodes.map(async (code) => {
              const newProductDescription = new ProductDescription({
                productId: savedProduct._id,
                languageCode: code,
                name: savedProduct.name,
                slug: savedProduct.name + code,
                longDescription: product.Details,
                shortDescription: product.shortDescription,
                metaData: {
                  title: product.SeotTitle,
                  author: " ",
                  description: product.SeoDescription,
                  keywords: product.SeoKeywords,
                },
              });

              await newProductDescription.save();
            })
          );
        }
      } catch (error) {
        console.error(`Error processing product ${product.ProductId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error performing bulk write:", error);
  }
};

module.exports = {
  vendorIBANumberFix,
  updateCountry,
  updateSpecification,
  updateSpecificationWeight,
  updateProducts,
};
