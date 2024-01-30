const seeding = {};
const fs = require("fs").promises;
const path = require("path");
const logsFilePath = path.resolve(__dirname, "logs", "index.txt");
const languages = ["ar", "tr", "en"];
const Brand = require("../models/brand.js");
const MasterDescription = require("../models/masterDescription.js");
const Category = require("../models/productCategory.js");
const axios = require("axios");
const FormData = require("form-data");
const ProductCategoryDescription = require("../models/productCategoryDescription.js");
const Variant = require("../models/variant.js");
const SubVaraint = require("../models/subVariant.js");
const SubVariant = require("../models/subVariant.js");
const Unit = require("../models/unit.js");
const Currency = require("../models/currency.js");
const ProductDescription = require("../models/productDescription.js");
const ShippingCompany = require("../models/shippingCompany.js");
const products = require("./data/products/mainEn.json");
const enProducts = require("./data/products/en.json");
const arProducts = require("./data/products/ar.json");
const trProducts = require("./data/products/tr.json");
const Product = require("../models/product.js");
const ProductVariant = require("../models/productVariant.js");
const ProductVariantDescription = require("../models/productVariantDescription.js");
const idCreator = require("../utils/idCreator.js");
const ProductCategory = require("../models/productCategory.js");

const logAction = (action, status, error = null) => {
  const currentTime = new Date();
  const logMessage = `${action} - ${status} at ${currentTime.toLocaleString()}`;

  if (error) {
    fs.appendFileSync(
      logsFilePath,
      `${logMessage} - Error: ${error}\n`,
      "utf-8"
    );
  } else {
    fs.appendFileSync(logsFilePath, `${logMessage}\n`, "utf-8");
  }
};

//* 1. Seed all brands ---------------------------------------------
const addBrandDescription = async (brand, languageCode) => {
  try {
    const timestamp = new Date().getTime();
    const uniqueIdentifier = Math.floor(Math.random() * 1000);
    const slug = `${brand.name}-${languageCode}-${timestamp}-${uniqueIdentifier}`;
    await MasterDescription.findOneAndUpdate(
      {
        mainPage: brand._id,
        languageCode: languageCode,
      },
      {
        name: brand.name,
        key: "brand",
        slug: slug,
        mainPage: brand._id,
        languageCode: languageCode,
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (err) {
    console.log(err);
    logAction("BrandDescription", "Failed", err);
  }
};

const processBrandsForLanguage = async (languageCode) => {
  console.log(languageCode);
  try {
    const brandsApiUrl = process.env.BRANDS_API;
    const token = process.env.TSOFT_TOKEN;
    const formData = new FormData();
    formData.append("token", token);
    formData.append("language", languageCode);
    formData.append("limit", 500);

    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await axios.post(brandsApiUrl, formData, axiosConfig);
    const brands = response.data.data;

    // Add brands
    for (const brand of brands) {
      const updatedBrand = await Brand.findOneAndUpdate(
        {
          brandId: brand.BrandId,
        },
        {
          name: brand.BrandName,
          brandId: brand.BrandId,
          isActive: true,
          isDeleted: false,
        },
        {
          new: true,
          upsert: true,
        }
      );
      await addBrandDescription(updatedBrand, languageCode);
    }

    console.log(`Completed processing brands for ${languageCode}`);
  } catch (err) {
    console.log(err);
    logAction(`Failed processing brands for ${languageCode}`, "Failed", err);
  }
};

seeding.seedBrands = async () => {
  try {
    logAction("Brands", "Started");
    await Promise.all(languages.map(processBrandsForLanguage));
    logAction("Brands", "Completed");
  } catch (err) {
    console.log(err);
    logAction("Brands", "Failed", err);
  }
};

//* 2. Seed all categories ------------------------------------------

const updateCategory = async (enData, arData, trData) => {
  const insertedCategories = [];

  const updateProductDescriptionsRecursive = async (
    data,
    parentCategoryId = null,
    languageCode
  ) => {
    try {
      await Promise.all(
        data.map(async (item) => {
          try {
            const category = await ProductCategory.findOne({
              categoryId: item.CategoryId,
            });
            if (category) {
              const FoundProductDescription =
                await ProductCategoryDescription.findOne({
                  productCategoryId: category._id,
                  languageCode: languageCode,
                });
              if (!FoundProductDescription) {
                const newData = new ProductCategoryDescription({
                  productCategoryId: category._id,
                  languageCode: languageCode,
                  name: item.text,
                  slug: item.SeoLink,
                });
                await newData.save();
                if (item.children && item.children.length > 0) {
                  await updateProductDescriptionsRecursive(
                    item.children,
                    category._id,
                    languageCode
                  );
                }
              }
            }
          } catch (error) {
            console.error(
              "Error updating ProductDescriptions for category:",
              item.category_id,
              error
            );
          }
        })
      );
    } catch (error) {
      console.error("Error updating ProductDescriptions:", error);
    }
  };

  const createCategoriesWithDepthOrder = async (categories) => {
    const createCategory = async (categoryData, depth = 0, parentId = null) => {
      try {
        const update = {
          categoryId: categoryData.CategoryId,
          name: categoryData.CategoryName,
          order: depth,
          parentId: parentId,
        };

        const savedCategory = await ProductCategory.findOneAndUpdate(
          { categoryId: categoryData.CategoryId },
          update,
          {
            new: true,
            upsert: true,
          }
        );

        insertedCategories.push(savedCategory);

        const children = categories.filter(
          (child) =>
            String(child.ParentCode) === String(categoryData.CategoryId)
        );
        for (const child of children) {
          await createCategory(child, depth + 1, savedCategory._id);
        }
      } catch (error) {
        console.error("Error creating category:", error);
      }
    };

    const baseCategories = categories.filter(
      (category) => !category.ParentCode
    );
    for (const category of baseCategories) {
      await createCategory(category);
    }
  };

  // Call the function with your category data
  await createCategoriesWithDepthOrder(enData);

  console.log("Inserted categories:", insertedCategories);

  try {
    await updateProductDescriptionsRecursive(enData, null, "en");
    await updateProductDescriptionsRecursive(arData, null, "ar");
    await updateProductDescriptionsRecursive(trData, null, "tr");
  } catch (error) {
    console.error("Error updating ProductDescriptions:", error);
  }
};

seeding.seedCategories = async () => {
  try {
    logAction("Categories", "Started");
    let enData = [];
    let arData = [];
    let trData = [];
    const getAllCategoriesEn = async () => {
      const productsApiUrl = process.env.CATEGORIES_API;
      const productsApiToken = process.env.TSOFT_TOKEN;
      const formData = new FormData();
      formData.append("token", productsApiToken);
      formData.append("start", 0);
      formData.append("limit", 500);
      formData.append("language", "en");
      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };

      try {
        const response = await axios.post(
          productsApiUrl,
          formData,
          axiosConfig
        );
        enData = response.data.data;
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };

    const getAllCategoriesAr = async () => {
      const productsApiUrl = process.env.CATEGORIES_API;
      const productsApiToken = process.env.TSOFT_TOKEN;
      const formData = new FormData();
      formData.append("token", productsApiToken);
      formData.append("start", 0);
      formData.append("limit", 500);
      formData.append("language", "ar");
      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };

      try {
        const response = await axios.post(
          productsApiUrl,
          formData,
          axiosConfig
        );
        arData = response.data.data;
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };

    const getAllCategoriesTr = async () => {
      const productsApiUrl = process.env.CATEGORIES_API;
      const productsApiToken = process.env.TSOFT_TOKEN;
      const formData = new FormData();
      formData.append("token", productsApiToken);
      formData.append("start", 0);
      formData.append("limit", 500);
      formData.append("language", "tr");
      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };

      try {
        const response = await axios.post(
          productsApiUrl,
          formData,
          axiosConfig
        );
        trData = response.data.data;
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };
    await getAllCategoriesEn();
    await getAllCategoriesAr();
    await getAllCategoriesTr();
    await updateCategory(enData, arData, trData);
    logAction("Categories", "Completed");
  } catch (err) {
    logAction("Categories", "Failed", err);
  }
};

//* 3. Seed all units -----------------------------------------------
seeding.seedUnits = async () => {
  // Your seeding logic for units goes here
};

//* 4. Seed all products --------------------------------------------
const updateProducts = async () => {
  try {
    for (const product of products) {
      try {
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
              let timestamp = new Date()
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

              await fs.writeFile(imagePath, response.data);

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

        const listProduct = enProducts.filter((item) => {
          return item.ProductId === product.ProductId;
        })[0];

        const validImages = downloadedImages.filter((image) => image !== null);

        const mainCategory =
          product.Categories[product.Categories.length - 1].CategoryId;

        const [category, brand, unit, currency, shippingCompany] =
          await Promise.all([
            Category.findOne({ categoryId: mainCategory }),
            Brand.findOne({ name: product.Brand }),
            Unit.findOne({ name: product.StockUnit }),
            Currency.findOne({ code: product.Currency }),
            ShippingCompany.findOne({ name: "AJEX" }),
          ]);

        let variants = [];
        if (listProduct.VariantFeature1Title) {
          const variant1 = await Variant.findOne({
            name: listProduct.VariantFeature1Title,
          });
          if (variant1) {
            variants.push({
              id: variant1._id,
              name: variant1.name,
              order: 1,
            });
          }
        }

        if (listProduct.VariantFeature2Title) {
          const variant2 = await Variant.findOne({
            name: listProduct.VariantFeature2Title,
          });
          variants.push({
            id: variant2._id,
            name: variant2.name,
            order: 2,
          });
        }

        const categoryId = category?._id;
        const brandId = brand?._id;
        const unitId = unit?._id;
        const currencyId = currency?._id;

        const notFixedDetails = {};

        if (product.Length) {
          notFixedDetails["length"] = Number(product.Length || 0);
        }

        const customId = await idCreator("product", false);

        let variantId;

        if (variants.length !== 0) {
          variantId = variants[0]._id;
        }

        const newProduct = new Product({
          name: listProduct.ProductName || " ",
          barCode:
            listProduct.BarCode ||
            `TST-${product.ProductName.substring(
              1,
              3
            )}-${category?.name?.substring(1, 3)}`,
          hsCode:
            product.HsCode ||
            listProduct.HsCode ||
            `TST-HS-${product.ProductName.substring(
              1,
              3
            )}-${category?.name?.substring(1, 3)}`,
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
          isApproved: true,
          isPublished: true,
          dc: product.CBM || " ",
          shippingCompany: shippingCompany || " ",
          variants: variants,
          varaintId: variantId,
          length: notFixedDetails.length || 0,
          ...notFixedDetails,
        });

        const savedProduct = await newProduct.save();

        let enProduct = enProducts.find((product) => {
          return product.ProductId === savedProduct.productId;
        });
        let arProduct = arProducts.find((product) => {
          return product.ProductId === savedProduct.productId;
        });
        let trProduct = trProducts.find((product) => {
          return product.ProductId === savedProduct.productId;
        });

        let timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(".", "");

        const newEnProductDescription = new ProductDescription({
          productId: savedProduct._id,
          languageCode: "en",
          name: enProduct.ProductName,
          slug: enProduct.SeoLink,
          longDescription: product.Details,
          shortDescription: product.Details || enProduct.shortDescription,
          metaData: {
            title: product.SeoTitle,
            author: " ",
            description: product.SeoDescription,
            keywords: product.SeoKeywords,
          },
        });

        await newEnProductDescription.save();

        const newArProductDescription = new ProductDescription({
          productId: savedProduct._id,
          languageCode: "ar",
          name: arProduct.ProductName,
          slug: arProduct.SeoLink,
          longDescription: product.Details,
          shortDescription: product.Details || arProduct.shortDescription,
          metaData: {
            title: product.SeoTitle,
            author: " ",
            description: product.SeoDescription,
            keywords: product.SeoKeywords,
          },
        });

        await newArProductDescription.save();

        const newTrProductDescription = new ProductDescription({
          productId: savedProduct._id,
          languageCode: "tr",
          name: trProduct.ProductName,
          slug: trProduct.SeoLink,
          longDescription: product.Details,
          shortDescription: product.Details || trProduct.shortDescription,
          metaData: {
            title: product.SeoTitle,
            author: " ",
            description: product.SeoDescription,
            keywords: product.SeoKeywords,
          },
        });

        await newTrProductDescription.save();

        // Variants linking with products
        if (variants.length !== 0) {
          let subVaraint1;
          let subVaraint2;
          if (variants[0]) {
            subVaraint1 = await SubVaraint.findOne({
              variantId: variants[0].id,
            });
            console.log(subVaraint1);
          }
          if (variants[1]) {
            subVaraint2 = await SubVaraint.findOne({
              variantId: variants[1].id,
            });
          }
          // Create new productvariant
          let productVaraintData = {
            customId: newProduct.customId,
            mainProductId: newProduct._id,
            firstVariantId: variants[0]?.id,
            secondVariantId: variants[1]?.id,
            firstVariantName: variants[0]?.name,
            secondVariantName: variants[1]?.name,
            firstSubVariantId: subVaraint1?._id,
            secondSubVariantId: subVaraint2?._id,
            firstSubVariantName: subVaraint1?.name,
            secondSubVariantName: subVaraint2?.name,
            buyingPrice: newProduct.buyingPrice,
            buyingPriceCurrency: newProduct.buyingPriceCurrency,
            sellingPrice: newProduct?.sellingPrice,
            height: newProduct.height,
            weight: newProduct.weight,
            width: newProduct.width,
            length: newProduct.length || 0,
            dc: newProduct.dc,
            shippingCompany: newProduct.shippingCompany,
            barCode: newProduct.barCode,
            media: newProduct.media,
          };
          const newProductVariant = new ProductVariant(productVaraintData);
          const savedProductVaraint = await newProductVariant.save();
          // Create new productvariantdescription
          const pvdEnData = {
            productVariantId: savedProductVaraint._id,
            languageCode: "en",
            name: enProduct.ProductName,
            slug: enProduct.ProductName + "en" + timestamp,
          };
          const newpvden = new ProductVariantDescription(pvdEnData);
          await newpvden.save();

          const pvdArData = {
            productVariantId: savedProductVaraint._id,
            languageCode: "ar",
            name: arProduct.ProductName,
            slug: arProduct.ProductName + "ar" + timestamp,
          };
          const newpvdar = new ProductVariantDescription(pvdArData);
          await newpvdar.save();

          const pvdTrData = {
            productVariantId: savedProductVaraint._id,
            languageCode: "tr",
            name: trProduct.ProductName,
            slug: trProduct.ProductName + "tr" + timestamp,
          };
          const newpvdtr = new ProductVariantDescription(pvdTrData);
          await newpvdtr.save();
        }
      } catch (error) {
        console.error(`Error processing product ${product.ProductId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error performing bulk write:", error);
  }
};

seeding.seedProducts = async () => {
  try {
    await updateProducts();
  } catch (err) {
    console.log(err);
  }
};

//* 5. Seed all variants --------------------------------------------

const updateCategories = async (languageCode) => {
  let start = 0;
  let limit = 500;
  try {
    const productsApiUrl = process.env.PRODUCTS_GET_API;
    const productsApiToken = process.env.TSOFT_TOKEN;
    while (true) {
      const formData = new FormData();
      formData.append("token", productsApiToken);
      formData.append("start", start);
      formData.append("limit", limit);

      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };
      const response = await axios.post(productsApiUrl, formData, axiosConfig);
      const products = response.data.data;
      if (typeof products !== "object" || !products || products.length === 0) {
        break;
      }
      await Promise.all(
        products.map(async (product) => {
          const categoryId = product.DefaultCategoryId;
          if (categoryId) {
            const foundCategory = await ProductCategory.findOne({
              categoryId: categoryId,
            });

            if (foundCategory) {
              let variantIds = [];
              if (product.VariantFeature1Title) {
                const foundVariant1 = await Variant.findOne({
                  name: product.VariantFeature1Title,
                });
                variantIds.push(foundVariant1?._id);
              }
              if (product.VariantFeature2Title) {
                const foundVariant2 = await Variant.findOne({
                  name: product.VariantFeature2Title,
                });
                variantIds.push(foundVariant2?._id);
              }
              if (product.VariantFeature3Title) {
                const foundVariant3 = await Variant.findOne({
                  name: product.VariantFeature2Title,
                });
                variantIds.push(foundVariant3?._id);
              }

              await ProductCategory.findOneAndUpdate(
                {
                  categoryId: categoryId,
                },
                {
                  ...foundCategory.toObject(),
                  variantIds: variantIds,
                  variantFilterIds: variantIds,
                  masterVariantId: variantIds[0],
                },
                {
                  new: true,
                }
              );
            }
          }
        })
      );

      start += limit;
    }
  } catch (err) {
    logAction("updateVariantProperties", "Failed", err);
    console.log(`Error while updating variant properties: ${err}`);
  }
};

const updateVariants = async (variants, languageCode) => {
  try {
    for (const variant of variants) {
      // console.log(variant);
      const newVariant = await Variant.findOneAndUpdate(
        { groupId: variant.GroupId },
        { name: variant.Name, groupId: variant.GroupId },
        { new: true, upsert: true }
      );

      await MasterDescription.findOneAndUpdate(
        { mainPage: newVariant._id, languageCode: languageCode },
        {
          mainPage: newVariant._id,
          key: "variant",
          languageCode,
          name: newVariant.name,
        },
        { new: true, upsert: true }
      );
    }
  } catch (err) {
    console.log(`Error while updating variants: ${err}`);
    logAction("updateVariants", "Failed", err);
  }
};

const updateVariantProperties = async (variantPropertiesData, languageCode) => {
  try {
    for (const property of variantPropertiesData) {
      const variant = await Variant.findOne({ groupId: property.GroupId });
      if (variant) {
        const newSubVariant = await SubVariant.findOneAndUpdate(
          { variantId: variant._id, propertyId: property.PropertyId },
          { name: property.Property, groupId: variant.GroupId },
          { new: true, upsert: true }
        );

        await MasterDescription.updateOne(
          { mainPage: newSubVariant._id, languageCode: languageCode },
          {
            mainPage: newSubVariant._id,
            key: "subVariant",
            languageCode,
            name: newSubVariant.name,
          },
          { new: true, upsert: true }
        );
      }
    }
  } catch (err) {
    console.log(`Error while updating VariantProperties: ${err}`);
    logAction("VariantProperties", "Failed", err);
  }
};

const processVariantPropertiesForLanguage = async (languageCode) => {
  try {
    let start = 0;
    let limit = 500;
    let variantValuesApiUrl = process.env.VARIANT_VALUES_API;

    while (true) {
      const formData = new FormData();
      formData.append("token", process.env.TSOFT_TOKEN);
      formData.append("start", start);
      formData.append("limit", limit);
      formData.append("language", languageCode);

      const axiosConfig = {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        variantValuesApiUrl,
        formData,
        axiosConfig
      );
      const variantPropertiesData = response.data.data;

      if (!variantPropertiesData || variantPropertiesData.length === 0) {
        break;
      }

      await updateVariantProperties(variantPropertiesData, languageCode);
      start += limit;
    }

    console.log(`Completed processing variant properties for ${languageCode}`);
  } catch (err) {
    console.log(
      `Error while processing variant properties for ${languageCode}: ${err}`
    );
  }
};

const processVariantsForLanguage = async (languageCode) => {
  try {
    let start = 0;
    let limit = 500;
    let variantGroupApiUrl = process.env.VARIANTS_GROUP_API;

    // while (true) {
    const formData = new FormData();
    formData.append("token", process.env.TSOFT_TOKEN);
    formData.append("start", start);
    formData.append("limit", limit);
    formData.append("language", languageCode);

    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(
      variantGroupApiUrl,
      formData,
      axiosConfig
    );
    const variants = response.data.data;

    // if (!variants || variants.length === 0) {
    //   break;
    // }

    await updateVariants(variants, languageCode);
    // start += limit;
    // }

    console.log(`Completed processing variants for ${languageCode}`);
  } catch (err) {
    console.log(`Error while processing variants for ${languageCode}: ${err}`);
  }
};

seeding.seedVariants = async () => {
  try {
    logAction("Variants", "Started");
    console.log("Variants seeding started");

    await Promise.all(languages.map(processVariantsForLanguage));
    await Promise.all(languages.map(processVariantPropertiesForLanguage));
    await Promise.all(languages.map(updateCategories));
    // await updateProducts();

    logAction("Variants", "Completed");
    console.log("Variants seeding completed");
  } catch (err) {
    logAction("Variants", "Failed", err);
    console.log(`Some error occurred while seeding variants: ${err}`);
  }
};

module.exports = seeding;
