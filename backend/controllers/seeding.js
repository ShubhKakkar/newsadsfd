const axios = require("axios");
const FormData = require("form-data");
const idCreator = require("../utils/idCreator.js");
const fs = require("fs");
// const sharp = require("sharp");
const mongoose = require("mongoose");

// models
const Unit = require("../models/unit");
const Brand = require("../models/brand");
const MasterDescription = require("../models/masterDescription");
const ProductCategory = require("../models/productCategory");
const ProductCategoryDescription = require("../models/productCategoryDescription");
const Product = require("../models/product");
const ProductDescription = require("../models/productDescription");
const Currency = require("../models/currency");
const ShippingCompany = require("../models/shippingCompany.js");
const Variant = require("../models/variant.js");
const SubVariant = require("../models/subVariant.js");
const ProductVariant = require("../models/productVariant.js");
const ProductVariantDescription = require("../models/productVariantDescription.js");
const VendorProduct = require("../models/vendorProduct.js");
const VendorProductVariant = require("../models/vendorProductVariant.js");
const ObjectId = require("mongoose").Types.ObjectId;

// languages
const languages = ["en", "ar", "tr"];

// chunk size
const chunkSize = 500;

// shipping company
const defaultShippingCompany = "AJEX";

// vendor
const defaultVendorId = new mongoose.Types.ObjectId("651e7d64c4bfaeadc751dc7a"); // change it while deploying

// HS Code generator
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate a random HS code starting with "TST-"
const generateRandomHSCode = () => {
  const chapter = getRandomInt(1, 99);
  const heading = getRandomInt(1, 99);
  const subheading = getRandomInt(1, 99);
  const productCode = getRandomInt(1, 9999);

  // Format the HS code with leading zeros and start with "TST-"
  const formattedHSCode = `TST-${chapter.toString().padStart(2, "0")}.${heading
    .toString()
    .padStart(2, "0")}.${subheading.toString().padStart(2, "0")}.${productCode
    .toString()
    .padStart(4, "0")}`;

  return formattedHSCode;
};

const twoDecimalPlaces = (num) => parseFloat(num.toFixed(2));

function sanitizeProductName(productName) {
  // Replace unwanted characters with an empty string
  const sanitizedProductName = productName.replace(/["'/\\]/g, "");

  return sanitizedProductName;
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

exports.seedUnits = async (req) => {
  try {
    const token = req.params.token;
    const formData = new FormData();
    formData.append("token", token);
    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    };
    // fetch units
    const response = await axios.post(
      "https://www.noonmar.com/rest1/product/getStockUnitList",
      formData,
      axiosConfig
    );
    if (response.data.success === false || !response.data) {
      throw new Error("Could not get stock unit list");
    }
    let data = response.data.data;
    // Store units and unit descriptions in db
    for (let unit of data) {
      const updatedUnit = await Unit.findOneAndUpdate(
        {
          stockUnitId: unit.StockUnitId,
        },
        {
          $set: {
            stockUnitId: unit.StockUnitId,
            name: unit.StockUnit,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
      for (let language of languages) {
        await MasterDescription.findOneAndUpdate(
          {
            stockUnitId: unit.StockUnitId,
            languageCode: language,
          },
          {
            $set: {
              mainPage: updatedUnit._id,
              key: "unit",
              languageCode: language,
              name: `${unit.StockUnit}-${language}`,
              stockUnitId: unit.StockUnitId,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }
    }
    return {
      success: true,
      length: data.length,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.seedBrands = async (req) => {
  try {
    const token = req.params.token;
    const formData = new FormData();
    formData.append("token", token);
    formData.append("limit", 500);
    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    };
    // fetch units
    const response = await axios.post(
      "https://www.noonmar.com/rest1/brand/getBrands",
      formData,
      axiosConfig
    );
    if (response.data.success === false || !response.data) {
      throw new Error("Could not get brands list");
    }
    let data = response.data.data;
    // Store units and unit descriptions in db
    for (let brand of data) {
      const updatedBrand = await Brand.findOneAndUpdate(
        {
          brandId: brand.BrandId,
        },
        {
          $set: {
            brandId: brand.brandId,
            name: brand.BrandName,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
      for (let language of languages) {
        await MasterDescription.findOneAndUpdate(
          {
            brandId: brand.BrandId,
            languageCode: language,
          },
          {
            $set: {
              key: "brand",
              languageCode: language,
              name: `${brand.BrandName.trim()}-${language}`,
              slug: `${brand.SeoLink}-${language}`,
              brandId: brand.brandId,
              mainPage: updatedBrand._id,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }
    }
    return {
      success: true,
      length: data.length,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.seedCategories = async (req) => {
  const token = req.params.token;
  try {
    const updateProductCategoryDescriptions = async (data, languageCode) => {
      try {
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          const category = await ProductCategory.findOne({
            categoryId: item.CategoryId,
          });
          console.log(item, category);
          if (category) {
            await ProductCategoryDescription.findOneAndUpdate(
              {
                productCategoryId: category._id,
                languageCode: languageCode,
              },
              {
                $set: {
                  productCategoryId: category._id,
                  languageCode: languageCode,
                  name: item.CategoryName.trim(),
                  slug: item.SeoLink,
                  metaData: {
                    title: item.SeoTitle,
                    description: item.SeoDescription,
                    keywords: item.SeoKeywords,
                    author: " ",
                  },
                },
              },
              {
                upsert: true,
                new: true,
              }
            );
          }
        }
      } catch (error) {
        throw new Error("Error updating ProductCategoryDescriptions:", error);
      }
    };

    const updateCategory = async (enData, arData, trData) => {
      const createCategoriesWithDepthOrder = async (categories) => {
        const updateCategories = async (
          categoryData,
          depth,
          parentId = null
        ) => {
          try {
            let extraData = {};
            if (parentId !== null) {
              extraData.parentId = parentId;
            }

            const update = {
              categoryId: categoryData.CategoryId,
              name: categoryData.CategoryName.trim(),
              order: depth,
              ...extraData,
            };

            const savedCategory = await ProductCategory.findOneAndUpdate(
              { categoryId: categoryData.CategoryId },
              update,
              {
                new: true,
                upsert: true,
              }
            );

            const children = categories.filter(
              (child) =>
                String(child.ParentCode) === String(categoryData.CategoryId)
            );

            for (let index = 0; index < children.length; index++) {
              const child = children[index];
              await updateCategories(child, index + 1, savedCategory._id);
            }
          } catch (error) {
            throw new Error("Error creating category:", error);
          }
        };
        const baseCategories = categories.filter(
          (category) => !category.ParentCode || category.ParentCode === "0"
        );
        for (let index = 0; index < baseCategories.length; index++) {
          const category = baseCategories[index];
          await updateCategories(category, index + 1);
        }
      };

      await createCategoriesWithDepthOrder(enData);
      await updateProductCategoryDescriptions(enData, "en");
      await updateProductCategoryDescriptions(arData, "ar");
      await updateProductCategoryDescriptions(trData, "tr");
    };

    const getAllCategories = async (language) => {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("start", 0);
      formData.append("limit", 500);
      formData.append("language", language);

      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };

      try {
        const response = await axios.post(
          "https://www.noonmar.com/rest1/category/getCategories",
          formData,
          axiosConfig
        );

        if (response.data.success === false || !response.data) {
          throw new Error(`Could not get category list ${language}`);
        }

        return response.data.data;
      } catch (error) {
        throw new Error("Error fetching categories data:", error);
      }
    };

    const [enData, arData, trData] = await Promise.all([
      getAllCategories("en"),
      getAllCategories("ar"),
      getAllCategories("tr"),
    ]);

    await updateCategory(enData, arData, trData);

    return {
      success: true,
      length: enData.length,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.seedProducts = async (req) => {
  let limit = 500;
  let round = 0;
  let token = req.params.token;
  const updateProducts = async (enData, arData, trData) => {
    try {
      let data = enData;
      for (let i = 0; i < data.length; i++) {
        const product = data[i];
        product.ProductName = sanitizeProductName(product.ProductName);
      const customId = await idCreator("product", false);
      const category = await ProductCategory.findOne({
          categoryId: product.DefaultCategoryId,
        });
      const brand = await Brand.findOne({
          brandId: product.BrandId,
        });
      const unit = await Unit.findOne({
          stockUnitId: product.StockUnitId,
        });

      let buyingPriceCurrency = await Currency.findOne({
          code: product.Currency,
        });

        if (!buyingPriceCurrency) {
          buyingPriceCurrency = {
            _id: new ObjectId("657c3c8f3e28674d584dfe1e"),
          };
        }

        const shippingCompany = await ShippingCompany.findOne({
          name: defaultShippingCompany,
        });

        const alternateProucts = [];
        if (product.RelatedProductsBlock1 !== "") {
          alternateProucts.push(product.RelatedProductsBlock1);
        }
        if (product.RelatedProductsBlock2 !== "") {
          alternateProucts.push(product.RelatedProductsBlock2);
        }
        if (product.RelatedProductsBlock3 !== "") {
          alternateProucts.push(product.RelatedProductsBlock3);
        }

      let alternateProductIds = [];

      for (let i = 0; i < alternateProucts.length; i++) {
        let alternateProduct = alternateProucts[i];
        let foundProduct = await Product.findOne({
                productId: alternateProduct,
              });
        alternateProductIds.push(foundProduct._id);
            }

        // Media
        let coverImage;

        const downloadedImages = await Promise.all(
          product.ImageUrls.map(async (image, index) => {
            try {
              const response = await axios.get(
                image.ImageUrl,
                {
                  responseType: "arraybuffer",
                },
                "binary"
              );

              const timestamp = new Date()
                .toISOString()
                .replace(/[-:]/g, "")
                .replace(".", "");

              const imageName = `product_${index + 1}${timestamp}.jpg`;
              const imagePath = `uploads/images/product/${imageName}`;

              const imageTarget = image.ImageUrl.split(
                "https://www.noonmar.com/Data/"
              )[1]
                .split(".png")[0]
                .split(".jpg")[0];

              // const compressedImageBuffer = await sharp(response.data)
              //     .jpeg({ quality: 80 })
              //     .toBuffer();

              fs.writeFile(imagePath, response.data, (err) => {
                if (err) {
                  console.error(`Error writing image to ${imagePath}:`, err);
                } else {
                  console.log(`Image written to ${imagePath}`);
                }
              });

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

        const sellingPrice =
          typeof product.SellingPrice === "string"
            ? parseFloat(product.SellingPrice).toFixed(2)
            : null;
        const buyingPrice =
          typeof product.BuyingPrice === "string"
            ? parseFloat(product.BuyingPrice).toFixed(2)
            : null;
        const barCode = product.Barcode
          ? product.Barcode
          : `TST-${product.ProductName.substring(0, 6)}-${generateUniqueId()}`;

        // Create Product and check if IsDisplayProduct
        const updatedProduct = await Product.findOneAndUpdate(
          {
            productId: product.ProductId,
          },
          {
            $set: {
              name: product.ProductName.trim(),
              barCode: barCode,
              hsCode: generateRandomHSCode(),
              customId: customId,
              categoryId: category._id,
              brandId: brand._id,
              unitId: unit._id,
              buyingPrice: Number(buyingPrice),
              buyingPriceCurrency: buyingPriceCurrency._id,
              sellingPrice: Number(sellingPrice),
              featureTitle: product.SeoLink,
              height: Number(product.Height),
              weight: Number(product.Weight),
              width: Number(product.Width),
              length: Number(product.Depth),
              dc: product.CBM,
              shippingCompany: shippingCompany._id,
              alternateProducts: alternateProductIds,
              media: validImages,
              coverImage: coverImage,
              // variants: variants, // [{id, name, order}]
              // varaintId: variantId,// last variant id
              productId: product.ProductId,
              isApproved: true,
              isPublished: true,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

        const enProuct = enData.find((product) => {
          return product.ProductId == updatedProduct.productId;
        });

        const arProuct = arData.find((product) => {
          return product.ProductId == updatedProduct.productId;
        });

        const trProuct = trData.find((product) => {
          return product.ProductId == updatedProduct.productId;
        });

        // Create Product Description
        const enProductDescription = await ProductDescription.findOneAndUpdate(
          {
            productId: updatedProduct._id,
            languageCode: "en",
          },
          {
            productId: updatedProduct._id,
            languageCode: "en",
            name: sanitizeProductName(enProuct.ProductName),
            slug: sanitizeProductName(enProuct.SeoLink),
            longDescription: enProuct.Details || " ",
            shortDescription: enProuct.Details || " ",
            metaData: {
              title: enProuct.SeoTitle,
              author: " ",
              description: enProuct.SeoDescription,
              keywords: enProuct.SeoKeywords,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        const arProductDescription = await ProductDescription.findOneAndUpdate(
          {
            productId: updatedProduct._id,
            languageCode: "ar",
          },
          {
            productId: updatedProduct._id,
            languageCode: "ar",
            name: sanitizeProductName(arProuct.ProductName),
            slug: sanitizeProductName(arProuct.SeoLink),
            longDescription: arProuct.Details || " ",
            shortDescription: arProuct.Details || " ",
            metaData: {
              title: arProuct.SeoTitle,
              author: " ",
              description: arProuct.SeoDescription,
              keywords: arProuct.SeoKeywords,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        const trProductDescription = await ProductDescription.findOneAndUpdate(
          {
            productId: updatedProduct._id,
            languageCode: "tr",
          },
          {
            productId: updatedProduct._id,
            languageCode: "tr",
            name: sanitizeProductName(trProuct.ProductName),
            slug: sanitizeProductName(trProuct.SeoLink),
            longDescription: trProuct.Details || " ",
            shortDescription: trProuct.Details || " ",
            metaData: {
              title: trProuct.SeoTitle,
              author: " ",
              description: trProuct.SeoDescription,
              keywords: trProuct.SeoKeywords,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        // Link Product with Vendor
        const vendorProduct = await VendorProduct.findOneAndUpdate(
          {
            vendorId: defaultVendorId,
            productId: updatedProduct._id,
          },
          {
            vendorId: defaultVendorId,
            productId: updatedProduct._id,
            buyingPrice: Math.round(Number(updatedProduct.buyingPrice)),
            buyingPriceCurrency: updatedProduct.buyingPriceCurrency,
            sellingPrice: Math.round(Number(updatedProduct.sellingPrice)),
            discountedPrice: Math.round(Number(updatedProduct.sellingPrice)),
          },
          {
            new: true,
            upsert: true,
          }
        );

        // Product Variant
        for (let i = 0; i < product.SubProducts.length; i++) {
          const productVariant = product.SubProducts[i];
          const productVariantId = productVariant.SubProductId;
          const productVariantCode = productVariant.SubProductCode;
          const propertyId1 = productVariant.PropertyId1;
          const propertyId2 = productVariant.propertyId2;
          let subVariant1;
          let subVariant2;
          let variant1;
          let variant2;
          let variantsArray = [];

          // link variant with category
          if (propertyId1 && propertyId1 !== "") {
            subVariant1 = await SubVariant.findOne({
              propertyId: propertyId1,
            });
            if (subVariant1) {
              variant1 = await Variant.findOne({
                groupId: subVariant1.groupId,
              });
              variantsArray.push(variant1);
            }
          }

          if (propertyId2 && propertyId2 !== "") {
            subVariant2 = await SubVariant.findOne({
              propertyId: propertyId2,
            });

            if (subVariant2) {
              variant2 = await Variant.findOne({
                groupId: subVariant2.groupId,
              });
              variantsArray.push(variant2);
            }
          }

          const categories = product.Categories;

          const categoryUpdates = categories.map((category) => ({
            updateOne: {
              filter: { categoryId: category.CategoryId },
              update: {
                $addToSet: {
                  variantIds: { $each: variantsArray },
                  variantFilterIds: { $each: variantsArray },
                },
              },
              upsert: true,
            },
          }));

          await ProductCategory.bulkWrite(categoryUpdates);

          // update variants in product
          if (variantsArray.length > 0) {
            await Product.findOneAndUpdate(
              { productId: updatedProduct.productId },
              {
                $set: {
                  variants: variantsArray,
                },
              },
              {
                upsert: true,
                new: true,
              }
            );
          }

          // update or create a new Product Variant

          const updatedProductVariant = await ProductVariant.findOneAndUpdate(
            {
              subProductId: productVariantId,
              mainProductId: updatedProduct._id,
            },
            {
              $set: {
                subProductId: productVariantId,
                customId: updatedProduct.customId,
                mainProductId: updatedProduct._id,
                firstVariantId: variant1?.id,
                secondVariantId: variant2?.id,
                firstVariantName: variant1?.name,
                secondVariantName: variant2?.name,
                firstSubVariantId: subVariant1?._id,
                secondSubVariantId: subVariant2?._id,
                firstSubVariantName: subVariant1?.name,
                secondSubVariantName: subVariant2?.name,
                buyingPrice: updatedProduct.buyingPrice,
                buyingPriceCurrency: updatedProduct.buyingPriceCurrency,
                sellingPrice: updatedProduct?.sellingPrice,
                height: updatedProduct.height,
                weight: updatedProduct.weight,
                width: updatedProduct.width,
                length: updatedProduct.length || 0,
                dc: updatedProduct.dc,
                shippingCompany: updatedProduct.shippingCompany,
                barCode: updatedProduct.barCode,
                media: updatedProduct.media,
              },
            },
            {
              new: true,
              upsert: true,
            }
          );

          // update ProductVariantDescription

          await ProductVariantDescription.findOneAndUpdate(
            {
              productVariantId: updatedProductVariant._id,
              languageCode: "en",
            },
            {
              $set: {
                productVariantId: updatedProductVariant._id,
                languageCode: "en",
                name: enProductDescription.name,
                slug: `${enProductDescription.slug}-en-${
                  updatedProductVariant?.firstSubVariantName?.split(" ")[0] ||
                  uuidv4()
                }`,
              },
            },
            {
              insert: true,
              upsert: true,
            }
          );

          await ProductVariantDescription.findOneAndUpdate(
            {
              productVariantId: updatedProductVariant._id,
              languageCode: "ar",
            },
            {
              $set: {
                productVariantId: updatedProductVariant._id,
                languageCode: "ar",
                name: arProductDescription.name,
                slug: `${arProductDescription.slug}-ar-${
                  updatedProductVariant?.firstSubVariantName?.split(" ")[0] ||
                  uuidv4()
                }`,
              },
            },
            {
              insert: true,
              upsert: true,
            }
          );

          await ProductVariantDescription.findOneAndUpdate(
            {
              productVariantId: updatedProductVariant._id,
              languageCode: "tr",
            },
            {
              set: {
                productVariantId: updatedProductVariant._id,
                languageCode: "tr",
                name: trProductDescription.name,
                slug: `${trProductDescription.slug}-tr-${
                  updatedProductVariant?.firstSubVariantName?.split(" ")[0] ||
                  uuidv4()
                }`,
              },
            },
            {
              insert: true,
              upsert: true,
            }
          );

          for (let i = 0; i < variantsArray.length; i++) {
            await VendorProductVariant.findOneAndUpdate(
              {
                vendorId: vendorProduct.vendorId,
                mainProductId: updatedProduct._id,
                productVariantId: updatedProductVariant._id,
              },
              {
                $set: {
                  vendorId: vendorProduct.vendorId,
                  mainProductId: vendorProduct.productId,
                  productVariantId: updatedProductVariant._id,
                  buyingPrice: vendorProduct.buyingPrice,
                  buyingPriceCurrency: vendorProduct.buyingPriceCurrency,
                  sellingPrice: vendorProduct.sellingPrice,
                  discountedPrice: vendorProduct.discountedPrice,
                  isActive: true,
                },
              },
              {
                new: true,
                upsert: true,
              }
            );
          }

          const transformedArray = variantsArray.map((variant, index) => {
            return {
              id: variant._id,
              name: variant.name,
              order: index + 1,
            };
          });

          // update product at this point
          await Product.findOneAndUpdate(
            {
              productId: updatedProduct._id,
            },
            {
              $set: {
                variants: transformedArray,
                variantId:
                  transformedArray.length > 0
                    ? transformedArray[transformedArray.length - 1].id
                    : "",
              },
            }
          );
        }

        round += 1;
      }
    } catch (err) {
      console.log(err);
    }
  };
  try {
    const fetchProducts = async (languageCode, start = 184, limit = 500) => {
      let count = 0;
      const data = [];

      while (true) {
        try {
          const formData = new FormData();
          formData.append("token", token);
          formData.append("start", start);
          formData.append("limit", limit);
          formData.append("Translation", languageCode);
          formData.append("FetchDetails", "true");
          formData.append("FetchAllCategories", "true");
          formData.append("FetchImageUrls", "true");
          formData.append("FetchRelatedBlocks", "true");
          formData.append("FetchSubProducts", "true");

          const response = await axios.post(
            "https://www.noonmar.com/rest1/product/get",
            formData,
            {
              headers: {
                ...formData.getHeaders(),
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.success === false || !response.data) {
            throw new Error("Could not get product list");
          }

          const responseData = response.data.data;
          data.push(...responseData);
          console.log(start);
          if (start > 1100) {
            break;
          }
          console.log(start);
          start += limit;
        } catch (error) {
          console.error(`Error fetching products: ${error.message}`);
          break;
        }
      }

      return data;
    };

    try {
      const [enData, arData, trData] = await Promise.all(
        languages.map((language) => fetchProducts(language))
      );

      console.log(
        `enData length: ${enData.length}, arData length: ${arData.length}, trData length: ${trData.length}`
      );

      await updateProducts(enData, arData, trData);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.seedVariants = async (req) => {
  try {
    const token = req.params.token;
    const formData = new FormData();
    formData.append("token", token);
    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    };
    // fetch variants
    const response = await axios.post(
      "https://www.noonmar.com/rest1/subProduct/getPropertyGroups",
      formData,
      axiosConfig
    );
    if (response.data.success === false || !response.data) {
      throw new Error("Could not get variants list");
    }
    let data = response.data.data;
    // Store variants and variant descriptions in db
    for (let variant of data) {
      const updatedVariant = await Variant.findOneAndUpdate(
        {
          groupId: variant.GroupId,
        },
        {
          $set: {
            groupId: variant.GroupId,
            name: variant.Name,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
      for (let language of languages) {
        await MasterDescription.findOneAndUpdate(
          {
            groupId: variant.GroupId,
            languageCode: language,
          },
          {
            $set: {
              mainPage: updatedVariant._id,
              key: "variant",
              languageCode: language,
              name: `${variant.Name}-${language}`,
              groupId: variant.GroupId,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }
    }
    return {
      success: true,
      length: data.length,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.seedSubVariants = async (req) => {
  try {
    const token = req.params.token;
    let start = 0;
    let limit = 500;
    while (true) {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("start", start);
      formData.append("limit", limit);
      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };
      // fetch subVariants
      const response = await axios.post(
        "https://www.noonmar.com/rest1/subProduct/getProperties",
        formData,
        axiosConfig
      );
      if (response.data.success === false || !response.data) {
        throw new Error("Could not get sub variants list");
      }
      let data = response.data.data;
      if (data.length === 0) {
        return {
          success: true,
        };
      }
      // Store subVariants in db
      for (let i = 0; i < data.length; i++) {
        const subVariant = data[i];
        const variant = await Variant.findOne({
          groupId: subVariant.GroupId,
        });
        if (variant) {
          const updatedSubVariant = await SubVariant.findOneAndUpdate(
            {
              propertyId: subVariant.PropertyId,
            },
            {
              $set: {
                name: subVariant.Property,
                variantId: variant._id,
                propertyId: subVariant.PropertyId,
                groupId: variant.groupId,
              },
            },
            {
              upsert: true,
              new: true,
            }
          );
          for (let i = 0; i < languages.length; i++) {
            await MasterDescription.findOneAndUpdate(
              {
                key: "subVariant",
                languageCode: languages[i],
                mainPage: updatedSubVariant._id,
              },
              {
                mainPage: updatedSubVariant._id,
                key: "subVariant",
                languageCode: languages[i],
                name: updatedSubVariant.name,
                propertyId: updatedSubVariant.propertyId,
              },
              {
                new: true,
                upsert: true,
              }
            );
          }
        }
      }
      start += limit;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
