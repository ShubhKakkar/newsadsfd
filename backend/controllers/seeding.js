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

// languages
const languages = ["en", "ar", "tr"];

// chunk size
const chunkSize = 500;

// shipping company
const defaultShippingCompany = "AJEX";

// vendor
const defaultVendorId = new mongoose.Types.ObjectId("64d371ceb03793f62886c1e8"); // change it while deploying

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
  let token = req.params.token;
  const updateProducts = async (enData, arData, trData) => {
    let data = enData;
    for (let i = 0; i < data.length; i++) {
      const product = data[i];
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
      const buyingPriceCurrency = await Currency.findOne({
        code: product.Currency,
      });
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

      // Create Product and check if IsDisplayProduct
      const updatedProduct = await Product.findOneAndUpdate(
        {
          productId: product.ProductId,
        },
        {
          $set: {
            name: product.ProductName.trim(),
            barCode: product.Barcode || "",
            hsCode: generateRandomHSCode(),
            customId: customId,
            categoryId: category._id,
            brandId: brand._id,
            unitId: unit._id,
            buyingPrice: product.BuyingPrice,
            buyingPriceCurrency: buyingPriceCurrency._id,
            sellingPrice: product.SellingPrice,
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

      console.log(1);

      const arProuct = arData.filter((product) => {
        product.productId = product.ProductId;
      });

      console.log(2);

      const trProuct = trData.filter((product) => {
        product.productId = product.ProductId;
      });

      console.log(3);

      // Create Product Description
      const enProductDescription = await ProductDescription.findOneAndUpdate(
        {
          productId: updatedProduct._id,
        },
        {
          productId: updatedProduct._id,
          languageCode: "en",
          name: updatedProduct.ProductName,
          slug: updatedProduct.SeoLink,
          longDescription: updatedProduct.Details || " ",
          shortDescription: updatedProduct.Details || " ",
          metaData: {
            title: updatedProduct.SeoTitle,
            author: " ",
            description: updatedProduct.SeoDescription,
            keywords: updatedProduct.SeoKeywords,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      console.log(4);

      const arProductDescription = await ProductDescription.findOneAndUpdate(
        {
          productId: updatedProduct._id,
        },
        {
          productId: updatedProduct._id,
          languageCode: "ar",
          name: arProuct.ProductName,
          slug: arProuct.SeoLink,
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

      console.log(5);

      const trProductDescription = await ProductDescription.findOneAndUpdate(
        {
          productId: updatedProduct._id,
        },
        {
          productId: updatedProduct._id,
          languageCode: "tr",
          name: trProuct.ProductName,
          slug: trProuct.SeoLink,
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
      await VendorProduct.findOneAndUpdate({
        vendorId: defaultVendorId,
        productId: updatedProduct._id,
        buyingPrice: updatedProduct.buyingPrice,
        buyingPriceCurrency: updatedProduct.buyingPriceCurrency,
        sellingPrice: updatedProduct.sellingPrice,
        discountedPrice: updatedProduct.sellingPrice,
      });

      // Product Variant
      for (let i = 0; i < product.SubProducts.length; i++) {
        const productVariant = product.SubProducts[i];
        const productVariantId = productVariant.SubProductId;
        const productVarintCode = productVariant.SubProductCode;
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
          variant1 = await Variant.findOne({
            groupId: subVariant1.groupId,
          });
          variantsArray.push(variant1);
        }

        if (propertyId2 && propertyId2 !== "") {
          subVariant2 = await SubVariant.findOne({
            propertyId: propertyId2,
          });
          variant2 = await Variant.findOne({
            groupId: subVariant2.groupId,
          });
          variantsArray.push(variant2);
        }

        const categories = product.Categories;

        for (let i = 0; i < categories.length; i++) {
          let category = categories[i];
          await ProductCategory.findOneAndUpdate(
            {
              categoryId: category.CategoryId,
            },
            {
              $addToSet: { variantIds: { $each: variantsArray } },
              $addToSet: { variantFilterIds: { $each: variantsArray } },
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
            insert: true,
            upsert: true,
          }
        );

        // update ProductVariantDescription

        await ProductVariantDescription.findOneAndUpdate(
          {
            productVarianId: updatedProductVariant._id,
            languageCode: "en",
          },
          {
            $set: {
              productVarianId: updatedProductVariant._id,
              languageCode: "en",
              name: enProductDescription.name,
              slug: enProductDescription.slug,
            },
          },
          {
            insert: true,
            upsert: true,
          }
        );

        await ProductVariantDescription.findOneAndUpdate(
          {
            productVarianId: updatedProductVariant._id,
            languageCode: "ar",
          },
          {
            $set: {
              productVarianId: updatedProductVariant._id,
              languageCode: "ar",
              name: arProductDescription.name,
              slug: arProductDescription.slug,
            },
          },
          {
            insert: true,
            upsert: true,
          }
        );

        await ProductVariantDescription.findOneAndUpdate(
          {
            productVarianId: updatedProductVariant._id,
            languageCode: "tr",
          },
          {
            $set: {
              productVarianId: updatedProductVariant._id,
              languageCode: "tr",
              name: trProductDescription.name,
              slug: trProductDescription.slug,
            },
          },
          {
            insert: true,
            upsert: true,
          }
        );
      }

      console.log(6);
    }
  };
  try {
    const fetchProducts = async (languageCode, start = 0, limit = 500) => {
      let count = 0;
      const data = [];

      while (true) {
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

        const axiosConfig = {
          headers: {
            ...formData.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        };

        const response = await axios.post(
          "https://www.noonmar.com/rest1/product/get",
          formData,
          axiosConfig
        );

        if (response.data.success === false || !response.data) {
          throw new Error("Could not get product list");
        }

        data.push(...response.data.data);
        console.log(count);
        count += response.data.data.length;

        if (count >= 11009) {
          break;
        }

        start += limit;
      }

      return data;
    };

    const tempArData = [
      {
          "ProductId": "110",
          "ProductCode": "T229",
          "ProductName": " خاتم فضة رجالي الأصلي من مسلسل قيامة أرطغرل بنقش عثماني",
          "DefaultCategoryId": "97",
          "DefaultCategoryName": "خواتم رجالية",
          "DefaultCategoryPath": "Takı Ve Aksesuar > Erkek Takıları > ",
          "SupplierProductCode": "8682336096326",
          "Barcode": "663113002295",
          "Stock": "1899",
          "IsActive": "true",
          "IsApproved": "true",
          "HasSubProducts": "true",
          "ComparisonSites": "false",
          "Vat": "0",
          "CurrencyId": "1",
          "BuyingPrice": "42.34201954",
          "SellingPrice": "71.98143322",
          "DiscountedPrice": "0",
          "SellingPriceVatIncludedNoDiscount": "71.98143322",
          "SellingPriceVatIncluded": "2208.89",
          "SeoLink": "خاتم-فضة-رجالي-الأصلي-من-مسلسل-قيامة-أرطغرل-بنقش-عثماني",
          "StockUnit": "عدد",
          "StockUnitId": "1",
          "SearchKeywords": "",
          "DisplayOnHomepage": "true",
          "IsNewProduct": "true",
          "OnSale": "true",
          "IsDisplayProduct": "false",
          "VendorDisplayOnly": "false",
          "DisplayWithVat": "true",
          "Brand": "Anı Yüzük",
          "BrandId": "14",
          "BrandLink": "ani-yuzuk",
          "Model": "Erkek Yüzükler",
          "ModelId": "13",
          "SupplierId": "23",
          "CustomerGroupDisplay": "-0---1---2--3-",
          "ImageUrl": "/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
          "Magnifier": "true",
          "MemberMinOrder": "0",
          "MemberMaxOrder": "0",
          "VendorMinOrder": "0",
          "VendorMaxOrder": "0",
          "ShortDescription": "",
          "SavingDate": "2021-07-05 16:14:05",
          "CreateDateTimeStamp": "1625490845",
          "CreateDate": "2021-07-05T16:14:05Z",
          "FilterGroupId": "0",
          "ListNo": "9815",
          "OwnerId": "0",
          "UpdateDate": "2024-02-13 00:18:01",
          "StockUpdateDate": "2023-07-06 11:37:31",
          "PriceUpdateDate": "2024-02-12 17:12:00",
          "IsActiveUpdateDate": "0000-00-00 00:00:00",
          "StockUpdatePlatform": "user",
          "PriceUpdatePlatform": "cron",
          "IsActiveUpdatePlatform": "",
          "Gender": "0",
          "OpportunityProduct": "0",
          "OpportunityStart": "0",
          "OpportunityFinish": "0",
          "AgeGroup": "",
          "CommentRate": "0",
          "CommentCount": "0",
          "DisablePaymentTypes": null,
          "DisableCargoCompany": "14",
          "StatViews": "9678",
          "StatRecommendations": "0",
          "HomepageSort": "0",
          "MostSoldSort": "0",
          "NewestSort": "0",
          "Point": "0",
          "EftRate": "0",
          "Numeric1": "0.0000",
          "HasImages": "true",
          "DefaultSubProductId": "0",
          "RelatedProductsIds1": "",
          "RelatedProductsIds2": "",
          "RelatedProductsIds3": "",
          "FreeDeliveryMember": "0",
          "FreeDeliveryVendor": "0",
          "FreeDeliveryForProduct": "0",
          "SearchRank": "0",
          "VariantFeature1Title": "Beden",
          "VariantFeature2Title": "Renk",
          "CountTotalSales": "2",
          "Label1": {
              "Name": "Free Shipping",
              "Value": 0
          },
          "Label2": {
              "Name": "Free Shpping",
              "Value": 0
          },
          "Label3": {
              "Name": "Kampanyalı Ürün",
              "Value": 0
          },
          "Label4": {
              "Name": "Aynı Gün Kargo",
              "Value": 0
          },
          "Label5": {
              "Name": "",
              "Value": 0
          },
          "Label6": {
              "Name": "",
              "Value": 0
          },
          "Label7": {
              "Name": "",
              "Value": 0
          },
          "Label8": {
              "Name": "",
              "Value": 0
          },
          "Label9": {
              "Name": "",
              "Value": 0
          },
          "Label10": {
              "Name": "En Çok Satan",
              "Value": 0
          },
          "Additional1": "",
          "Additional2": "",
          "Additional3": "",
          "Additional4": "",
          "Additional5": "",
          "Currency": "USD",
          "Supplier": "Anı Hediyelik Ve Aksesuar Limited Şirketi",
          "DefaultCategoryCode": "T36",
          "ImageUrlCdn": "",
          "Details": "<h3>الخواتم الرجالية ..... تضفي الأناقة على إطلالتك.... أقتنيها بعناية</h3><p>ظهر اهتمام مؤخرًا كبير لارتداء الخواتم الرجالية التي تعطي انطباع الأناقة والثقة بشرط تنسيقها مع مظهرك فأحرص دائمًا على أقتناء الخواتم من الفضرة الاسترليني عيار 925 فأمتلاكك خاتم واحد ثمين أفضل من الحصول على أكثر من خاتم بلا قيمة.</p><p>تساعد المجوهرات المصنوعة من الفضة الإسترليني على التخلص من الشحنات السلبية الموجودة في جسم الإنسان وتقلل من التوتر والضغط العصبي.</p><h3>خواتم رجاليه فضة تركية :</h3><p>تميزت تركيا بصناعة اجمل خواتم الفضة للرجال وجسدت مهارة الحرفيين الأتراك والذوق العالي في تصميم خواتم رجالية فاخرة من الفضة ودمجها مع أنواع احجار كريمة مختلفة تزيد من جمالها . ونحن بدورنا في نون مار نقدم لكم تشكيلة كبيرة ومميزة من خواتم رجاليه فضة مصنوعة من الفضة الاسترليني ونضعها بين أيديكم لتختاروا منها ما يناسب ذوقكم الرفيع ويعكس شخصيتكم الفريدة .</p><h3>مسلسل قيامة ارطغرل خاتم فضة رجالي اصلي عيار 925 بتصميم عثماني :</h3><p>يحكي مسلسل قيامة ارطغرل قصة حياة أرطغرل ابن سليمان شاه  والد عثمان خان مؤسس الدولة العثمانية  كقائد قبيلة تجمعت له جميع عناصر تكوين دولة جديدة  لتحمل لواء الفتح الإسلامي في لحظات من التاريخ عاني فيها العالم الإسلامي حالة من الشتات والضعف. بدأ انتاج المسلسل في مايو 2014 على مدار خمسة مواسم ويعد نقلة في الدراما الإسلامية  كما يحمل الكثير من المعاني والرسائل التي لا أعلم كيف لم يتم نشرها حتي الآن! فمن أول حلقة يُلاحظ الطابع الإسلامي الظاهر في كافة تفاصيل المسلسل وأنّه ليس  مجرد سرد للتاريخ   بل إن الكاتب قد اعتنى تمامًا باختيار ألفاظه وعباراته بدقة فائقة لتتناسب تمامًا مع الرسائل التي يريد إيصالها. فالدراما التركية تعكس حالة التعدد بالمجتمع التركي  حيث الصراع بين الهوية الإسلامية والهوى الغربي فقد جاء المسلسل كرد  فني  على مسلسل حريم السلطان .</p><h3>ما هي مواصفات مسلسل قيامة ارطغرل خاتم فضة رجالي اصلي عيار 925 بتصميم عثماني ؟</h3><ol><li>يتم إنتاجه من الفضة الاسترلينية عيار 925.</li><li>الوزن حوالي 21 غرام. سطح الخاتم 3.5 سم</li><li>تم نقش ثلاث هلالات في منتصف رمز الشمس.</li><li>يحتوي الخاتم على شعار TRT و قيامة أرطغرل وشعار اني يوزوك.</li><li>تم انتاجه بتصميم يعكس معاني الشجاعة والقوة بصورة انيقة عصرية.</li></ol><h3>هل تبحث عن خاتم فضة رجالي تركي يحمل روح القيامة والبطولة ؟</h3><p>نقدم اليك خاتم قيامة ارطغرل اجمل خواتم الفضة للرجال الذي تم تصميمه بشكل يعكس قصة الموسم الاخير مع لمسة عصرية ينتظرك في نون مار .. المنتجات المرخصة من مسلسل  قيامة أرطغرل    الذي تتم مشاهدته في أكثر من 60 دولة في جميع أنحاء العالم والذي نال إعجاب الملايين   تجدها فقط في نون مار ... اطلبه الآن</p><div><br></div>",
          "Width": "8",
          "Height": "8",
          "Depth": "8",
          "Weight": "0.12",
          "CBM": "0",
          "WarrantyInfo": "",
          "DeliveryInfo": "",
          "DeliveryTime": "5",
          "ProductNote": "<h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><b style=transition: none 0s ease 0s;>Diriliş Ertuğrul Dizisi Osman Bey Zihgir Yüzüğü (Küçük Boy) Ürün Özellikleri</b></span></h2><ul style=transition: none 0s ease 0s; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; list-style-type: none; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>925 ayar gümüşle üretilmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Ağırlık yaklaşık 21 gr. Yüzük üst yüzey 3,5 cm</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>3 hilal tasarım ortasında güneş motifi işlenmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Yüzük içinde TRT, Diriliş Ertuğrul ve Anı Yüzük logosu yer almaktadır.</span></li></ul><h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Tüm dünyada 60dan fazla ülkede izlenen ve milyonların beğenisini kazanan Diriliş Ertuğrul dizisi lisanslı ürünleri sadece Anı Yüzükte sizi bekliyor.</span></h2><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>TRT1’de ekrana gelen ve 5 sezondur Çarşamba günlerinin lideri olan “Diriliş Ertuğrul dizisi yeni sezonda bambaşka bir konseptle izleyici karşısına çıkmaya hazırlanıyor. <br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;>Başrollerinde Engin Altan Düzyatan, Esra Bilgiç, Cengiz Coşkun ve Hülya Darcan gibi oyuncuların yer aldığı Diriliş Ertuğrul yalnızca etkili hikayesi ve oyuncularıyla değil aynı zamanda dizide kullanılan aksesuarlarla da pek çok kişinin beğenisini kazandı.</span><br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Osmanın parmağında taşıdığı baş parmak zihgir yüzüğü, dizinin yeni hikayesine uygun olarak Anı Yüzük tarafından yeniden tasarlandı. </span></p><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><br style=transition: none 0s ease 0s;>Diriliş ruhunu üzerinde taşımak isteyenler siz de diziyle aynı anda satışa çıkacak bu lisanslı ürüne yalnızca Anı Yüzük sponsorluğu ile sahip olabilirsiniz.</span></p>",
          "Document": "",
          "Warehouse": "",
          "PersonalizationId": "0",
          "SeoTitle": " خاتم فضة رجالي الأصلي من مسلسل قيامة أرطغرل بنقش عثماني",
          "SeoDescription": "",
          "Gtip": "",
          "CountryOfOrigin": "TR",
          "Categories": [
              {
                  "CategoryId": "97",
                  "CategoryCode": "T36"
              }
          ],
          "ImageUrls": [
              {
                  "ImageUrl": "https://www.noonmar.com/Data/K/D11/458.jpg",
                  "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
                  "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-O.jpg",
                  "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-B.jpg",
                  "ListNo": 0,
                  "PropertyId": 0,
                  "Details": {
                      "RawSize": "",
                      "RawHeight": "",
                      "RawWidth": "",
                      "SmallSize": "",
                      "SmallWidth": "",
                      "SmallHeight": "",
                      "SmallQuality": "",
                      "MediumSize": "",
                      "MediumWidth": "",
                      "MediumHeight": "",
                      "MediumQuality": "",
                      "BigSize": "",
                      "BigWidth": "",
                      "BigHeight": "",
                      "BigQuality": ""
                  }
              },
              {
                  "ImageUrl": "https://www.noonmar.com/Data/K/D11/453.jpg",
                  "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-K.jpg",
                  "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-O.jpg",
                  "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-B.jpg",
                  "ListNo": 1,
                  "PropertyId": 0,
                  "Details": {
                      "RawSize": "",
                      "RawHeight": "",
                      "RawWidth": "",
                      "SmallSize": "",
                      "SmallWidth": "",
                      "SmallHeight": "",
                      "SmallQuality": "",
                      "MediumSize": "",
                      "MediumWidth": "",
                      "MediumHeight": "",
                      "MediumQuality": "",
                      "BigSize": "",
                      "BigWidth": "",
                      "BigHeight": "",
                      "BigQuality": ""
                  }
              },
              {
                  "ImageUrl": "https://www.noonmar.com/Data/K/D11/454.jpg",
                  "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-K.jpg",
                  "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-O.jpg",
                  "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-B.jpg",
                  "ListNo": 2,
                  "PropertyId": 0,
                  "Details": {
                      "RawSize": "",
                      "RawHeight": "",
                      "RawWidth": "",
                      "SmallSize": "",
                      "SmallWidth": "",
                      "SmallHeight": "",
                      "SmallQuality": "",
                      "MediumSize": "",
                      "MediumWidth": "",
                      "MediumHeight": "",
                      "MediumQuality": "",
                      "BigSize": "",
                      "BigWidth": "",
                      "BigHeight": "",
                      "BigQuality": ""
                  }
              },
              {
                  "ImageUrl": "https://www.noonmar.com/Data/K/D11/455.jpg",
                  "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-K.jpg",
                  "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-O.jpg",
                  "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-B.jpg",
                  "ListNo": 3,
                  "PropertyId": 0,
                  "Details": {
                      "RawSize": "",
                      "RawHeight": "",
                      "RawWidth": "",
                      "SmallSize": "",
                      "SmallWidth": "",
                      "SmallHeight": "",
                      "SmallQuality": "",
                      "MediumSize": "",
                      "MediumWidth": "",
                      "MediumHeight": "",
                      "MediumQuality": "",
                      "BigSize": "",
                      "BigWidth": "",
                      "BigHeight": "",
                      "BigQuality": ""
                  }
              }
          ],
          "Translation": {
              "ar": {
                  "ProductName": " خاتم فضة رجالي الأصلي من مسلسل قيامة أرطغرل بنقش عثماني",
                  "Details": "<h3>الخواتم الرجالية ..... تضفي الأناقة على إطلالتك.... أقتنيها بعناية</h3><p>ظهر اهتمام مؤخرًا كبير لارتداء الخواتم الرجالية التي تعطي انطباع الأناقة والثقة بشرط تنسيقها مع مظهرك فأحرص دائمًا على أقتناء الخواتم من الفضرة الاسترليني عيار 925 فأمتلاكك خاتم واحد ثمين أفضل من الحصول على أكثر من خاتم بلا قيمة.</p><p>تساعد المجوهرات المصنوعة من الفضة الإسترليني على التخلص من الشحنات السلبية الموجودة في جسم الإنسان وتقلل من التوتر والضغط العصبي.</p><h3>خواتم رجاليه فضة تركية :</h3><p>تميزت تركيا بصناعة اجمل خواتم الفضة للرجال وجسدت مهارة الحرفيين الأتراك والذوق العالي في تصميم خواتم رجالية فاخرة من الفضة ودمجها مع أنواع احجار كريمة مختلفة تزيد من جمالها . ونحن بدورنا في نون مار نقدم لكم تشكيلة كبيرة ومميزة من خواتم رجاليه فضة مصنوعة من الفضة الاسترليني ونضعها بين أيديكم لتختاروا منها ما يناسب ذوقكم الرفيع ويعكس شخصيتكم الفريدة .</p><h3>مسلسل قيامة ارطغرل خاتم فضة رجالي اصلي عيار 925 بتصميم عثماني :</h3><p>يحكي مسلسل قيامة ارطغرل قصة حياة أرطغرل ابن سليمان شاه  والد عثمان خان مؤسس الدولة العثمانية  كقائد قبيلة تجمعت له جميع عناصر تكوين دولة جديدة  لتحمل لواء الفتح الإسلامي في لحظات من التاريخ عاني فيها العالم الإسلامي حالة من الشتات والضعف. بدأ انتاج المسلسل في مايو 2014 على مدار خمسة مواسم ويعد نقلة في الدراما الإسلامية  كما يحمل الكثير من المعاني والرسائل التي لا أعلم كيف لم يتم نشرها حتي الآن! فمن أول حلقة يُلاحظ الطابع الإسلامي الظاهر في كافة تفاصيل المسلسل وأنّه ليس  مجرد سرد للتاريخ   بل إن الكاتب قد اعتنى تمامًا باختيار ألفاظه وعباراته بدقة فائقة لتتناسب تمامًا مع الرسائل التي يريد إيصالها. فالدراما التركية تعكس حالة التعدد بالمجتمع التركي  حيث الصراع بين الهوية الإسلامية والهوى الغربي فقد جاء المسلسل كرد  فني  على مسلسل حريم السلطان .</p><h3>ما هي مواصفات مسلسل قيامة ارطغرل خاتم فضة رجالي اصلي عيار 925 بتصميم عثماني ؟</h3><ol><li>يتم إنتاجه من الفضة الاسترلينية عيار 925.</li><li>الوزن حوالي 21 غرام. سطح الخاتم 3.5 سم</li><li>تم نقش ثلاث هلالات في منتصف رمز الشمس.</li><li>يحتوي الخاتم على شعار TRT و قيامة أرطغرل وشعار اني يوزوك.</li><li>تم انتاجه بتصميم يعكس معاني الشجاعة والقوة بصورة انيقة عصرية.</li></ol><h3>هل تبحث عن خاتم فضة رجالي تركي يحمل روح القيامة والبطولة ؟</h3><p>نقدم اليك خاتم قيامة ارطغرل اجمل خواتم الفضة للرجال الذي تم تصميمه بشكل يعكس قصة الموسم الاخير مع لمسة عصرية ينتظرك في نون مار .. المنتجات المرخصة من مسلسل  قيامة أرطغرل    الذي تتم مشاهدته في أكثر من 60 دولة في جميع أنحاء العالم والذي نال إعجاب الملايين   تجدها فقط في نون مار ... اطلبه الآن</p><div><br></div>",
                  "Document": "",
                  "ShortDescription": "",
                  "WarrantyInfo": "",
                  "DeliveryInfo": "",
                  "SeoLink": "خاتم-فضة-رجالي-الأصلي-من-مسلسل-قيامة-أرطغرل-بنقش-عثماني",
                  "SeoDescription": "",
                  "SeoTitle": " خاتم فضة رجالي الأصلي من مسلسل قيامة أرطغرل بنقش عثماني",
                  "Additional1": "",
                  "Additional2": "",
                  "Additional3": "",
                  "Additional4": "",
                  "Additional5": "",
                  "DefaultCategoryName": "خواتم رجالية",
                  "StockUnit": "عدد",
                  "Brand": "Anı Yüzük",
                  "Model": "Erkek Yüzükler",
                  "BrandLink": "ani-yuzuk"
              }
          },
          "RelatedProductsBlock1": "",
          "RelatedProductsBlock2": "",
          "RelatedProductsBlock3": "",
          "SubProducts": [
              {
                  "SubProductId": "1152",
                  "SubProductCode": "T1152",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "24",
                  "Property2": "",
                  "PropertyId1": "324",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914676",
                  "UpdateDate": "2023-04-19T17:31:16Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1153",
                  "SubProductCode": "T1153",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "25",
                  "Property2": "",
                  "PropertyId1": "1465",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914676",
                  "UpdateDate": "2023-04-19T17:31:16Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1154",
                  "SubProductCode": "T1154",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "26",
                  "Property2": "",
                  "PropertyId1": "496",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914676",
                  "UpdateDate": "2023-04-19T17:31:16Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1155",
                  "SubProductCode": "T1155",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "27",
                  "Property2": "",
                  "PropertyId1": "497",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914676",
                  "UpdateDate": "2023-04-19T17:31:16Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1156",
                  "SubProductCode": "T1156",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "28",
                  "Property2": "",
                  "PropertyId1": "498",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914676",
                  "UpdateDate": "2023-04-19T17:31:16Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1157",
                  "SubProductCode": "T1157",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "29",
                  "Property2": "",
                  "PropertyId1": "499",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1158",
                  "SubProductCode": "T1158",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "30",
                  "Property2": "",
                  "PropertyId1": "188",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "2022-03-09 08:30:32",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1159",
                  "SubProductCode": "T1159",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "31",
                  "Property2": "",
                  "PropertyId1": "190",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1160",
                  "SubProductCode": "T1160",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "32",
                  "Property2": "",
                  "PropertyId1": "189",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1161",
                  "SubProductCode": "T1161",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "16",
                  "Property2": "",
                  "PropertyId1": "1466",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1162",
                  "SubProductCode": "T1162",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "22",
                  "Property2": "",
                  "PropertyId1": "321",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "99",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "2023-07-06 11:37:31",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1165",
                  "SubProductCode": "T1165",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "14",
                  "Property2": "",
                  "PropertyId1": "1467",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "2022-06-10 08:23:41",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1166",
                  "SubProductCode": "T1166",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "15",
                  "Property2": "",
                  "PropertyId1": "1468",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1167",
                  "SubProductCode": "T1167",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "17",
                  "Property2": "",
                  "PropertyId1": "1469",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1168",
                  "SubProductCode": "T1168",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "18",
                  "Property2": "",
                  "PropertyId1": "323",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "2022-11-18 08:36:46",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1169",
                  "SubProductCode": "T1169",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "19",
                  "Property2": "",
                  "PropertyId1": "1470",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1170",
                  "SubProductCode": "T1170",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "20",
                  "Property2": "",
                  "PropertyId1": "322",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1171",
                  "SubProductCode": "T1171",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "21",
                  "Property2": "",
                  "PropertyId1": "1471",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              },
              {
                  "SubProductId": "1172",
                  "SubProductCode": "T1172",
                  "MainProductId": "110",
                  "Barcode": "DİRİLİŞ-0297-D",
                  "Property1": "23",
                  "Property2": "",
                  "PropertyId1": "1472",
                  "PropertyId2": "0",
                  "Property1ListNo": "0",
                  "Property2ListNo": null,
                  "Stock": "100",
                  "CBM": "0",
                  "Weight": "0.11",
                  "SupplierSubProductCode": null,
                  "BuyingPrice": "0",
                  "SellingPrice": "0",
                  "DiscountedSellingPrice": "0",
                  "VendorSellingPrice": "0",
                  "IsActive": "true",
                  "AddingDate": "0",
                  "CreateDateTimeStamp": "0",
                  "CreateDate": "1970-01-01T02:00:00Z",
                  "UpdateDateTimeStamp": "1681914677",
                  "UpdateDate": "2023-04-19T17:31:17Z",
                  "HasImage": "true",
                  "OwnerId": "0",
                  "OwnerName": "",
                  "Point": "0",
                  "StockUpdateDate": "0000-00-00 00:00:00",
                  "PriceUpdateDate": "0000-00-00 00:00:00"
              }
          ]
      }
  ];
  const tempEnData = [
    {
        "ProductId": "110",
        "ProductCode": "T229",
        "ProductName": "Resurrection Ertugrul Series silver ring for men 925 ottoman design",
        "DefaultCategoryId": "97",
        "DefaultCategoryName": "Men's Rings",
        "DefaultCategoryPath": "Takı Ve Aksesuar > Erkek Takıları > ",
        "SupplierProductCode": "8682336096326",
        "Barcode": "663113002295",
        "Stock": "1899",
        "IsActive": "true",
        "IsApproved": "true",
        "HasSubProducts": "true",
        "ComparisonSites": "false",
        "Vat": "0",
        "CurrencyId": "1",
        "BuyingPrice": "42.34201954",
        "SellingPrice": "71.98143322",
        "DiscountedPrice": "0",
        "SellingPriceVatIncludedNoDiscount": "71.98143322",
        "SellingPriceVatIncluded": "2208.89",
        "SeoLink": "resurrection-ertugrul-series-silver-ring-for-men-925-ottoman-design",
        "StockUnit": "Peice",
        "StockUnitId": "1",
        "SearchKeywords": "",
        "DisplayOnHomepage": "true",
        "IsNewProduct": "true",
        "OnSale": "true",
        "IsDisplayProduct": "false",
        "VendorDisplayOnly": "false",
        "DisplayWithVat": "true",
        "Brand": "Anı Yüzük",
        "BrandId": "14",
        "BrandLink": "ani-yuzuk",
        "Model": "Erkek Yüzükler",
        "ModelId": "13",
        "SupplierId": "23",
        "CustomerGroupDisplay": "-0---1---2--3-",
        "ImageUrl": "/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
        "Magnifier": "true",
        "MemberMinOrder": "0",
        "MemberMaxOrder": "0",
        "VendorMinOrder": "0",
        "VendorMaxOrder": "0",
        "ShortDescription": "",
        "SavingDate": "2021-07-05 16:14:05",
        "CreateDateTimeStamp": "1625490845",
        "CreateDate": "2021-07-05T16:14:05Z",
        "FilterGroupId": "0",
        "ListNo": "9815",
        "OwnerId": "0",
        "UpdateDate": "2024-02-13 00:18:01",
        "StockUpdateDate": "2023-07-06 11:37:31",
        "PriceUpdateDate": "2024-02-12 17:12:00",
        "IsActiveUpdateDate": "0000-00-00 00:00:00",
        "StockUpdatePlatform": "user",
        "PriceUpdatePlatform": "cron",
        "IsActiveUpdatePlatform": "",
        "Gender": "0",
        "OpportunityProduct": "0",
        "OpportunityStart": "0",
        "OpportunityFinish": "0",
        "AgeGroup": "",
        "CommentRate": "0",
        "CommentCount": "0",
        "DisablePaymentTypes": null,
        "DisableCargoCompany": "14",
        "StatViews": "9678",
        "StatRecommendations": "0",
        "HomepageSort": "0",
        "MostSoldSort": "0",
        "NewestSort": "0",
        "Point": "0",
        "EftRate": "0",
        "Numeric1": "0.0000",
        "HasImages": "true",
        "DefaultSubProductId": "0",
        "RelatedProductsIds1": "",
        "RelatedProductsIds2": "",
        "RelatedProductsIds3": "",
        "FreeDeliveryMember": "0",
        "FreeDeliveryVendor": "0",
        "FreeDeliveryForProduct": "0",
        "SearchRank": "0",
        "VariantFeature1Title": "Beden",
        "VariantFeature2Title": "Renk",
        "CountTotalSales": "2",
        "Label1": {
            "Name": "Free Shipping",
            "Value": 0
        },
        "Label2": {
            "Name": "Free Shpping",
            "Value": 0
        },
        "Label3": {
            "Name": "Kampanyalı Ürün",
            "Value": 0
        },
        "Label4": {
            "Name": "Aynı Gün Kargo",
            "Value": 0
        },
        "Label5": {
            "Name": "",
            "Value": 0
        },
        "Label6": {
            "Name": "",
            "Value": 0
        },
        "Label7": {
            "Name": "",
            "Value": 0
        },
        "Label8": {
            "Name": "",
            "Value": 0
        },
        "Label9": {
            "Name": "",
            "Value": 0
        },
        "Label10": {
            "Name": "En Çok Satan",
            "Value": 0
        },
        "Additional1": "",
        "Additional2": "",
        "Additional3": "",
        "Additional4": "",
        "Additional5": "",
        "Currency": "USD",
        "Supplier": "Anı Hediyelik Ve Aksesuar Limited Şirketi",
        "DefaultCategoryCode": "T36",
        "ImageUrlCdn": "",
        "Details": "<h3>Men&#39s rings ..... add elegance to your look .... I own them with care</h3><p>Recently  great interest has appeared in wearing men&#39s rings  which give the impression of elegance and confidence  provided that they are coordinated with your appearance  so I always make sure to acquire rings of 925 sterling silver  so having one precious ring is better than having more than one ring without value. Sterling silver jewelry helps eliminate negative charges in the human body and reduces tension and stress.</p><h3>Turkish silver mens rings:</h3><p>Turkey occupied a distinguished position in the world of the silver ring for men and embodied the skill of Turkish craftsmen and high taste in designing the rings and merging them with different types of gemstones increase its beauty. We  at Noonmar  offer you a large and distinctive collection of mens rings made of sterling silver and put them in your hands to choose from them what suits your high taste and reflects your unique personality.</p><h3>Resurrection Ertuğrul Series silver ring for men 925 ottoman design:</h3><p>The series of the Artgrel Resurrection tells the story of the life of Artgrel Ibn Suleiman Shah  the father of Osman Khan  founder of the Ottoman Empire  as a tribe leader who gathered for him all the elements of the formation of a new country  to carry the banner of the Islamic conquest in moments of history in which the Islamic world suffered a state of diaspora and weakness. The production of the series began in May 2014 for five seasons and is considered a shift in Islamic drama  as it carries a lot of meanings and messages that I do not know how it has not been published yet! From the first episode  the Islamic character  which appears in all the details of the series  is observed and is not a “mere narration of history.” Rather  the writer has taken great care in choosing his words and expressions very precisely to fit perfectly with the messages he wants to communicate. Turkish drama reflects the state of pluralism in Turkish society  where the conflict between the Islamic identity and the Western passion is the series came as an  artistic  response to the series Harem Al-Sultan.</p><h3>What are the features of the Resurrection Ertuğrul Series silver ring for men 925 Simple design?</h3><ol><li>It is produced with 925 sterling silver.</li><li>Weight approx. 21 g. Ring surface 3.5 cm</li><li>3 crescent design embroidered in the middle of the solar motif.</li><li>The ring includes the TRT  Diriliş Ertuğrul and Anı Yüzük logo.</li><li>It was produced with a simple design that reflects the meanings of courage and strength in a stylish and modern way.</li></ol><h3>Are you looking for a silver ring for men that carries the resurrection and heroism?</h3><p>We present to you the Artegral Resurrection Ring  the most beautiful silver ring for men  which was designed to reflect the story of the last season with a double-headed eagle for more glory and splendor with a modern touch waiting for you at Noonmar... Licensed products from the  Artegral Resurrection  series  which is seen in more than 60 countries around the world and who have been liked by millions  can be found only at Noonmar ... Order it now</p>",
        "Width": "8",
        "Height": "8",
        "Depth": "8",
        "Weight": "0.12",
        "CBM": "0",
        "WarrantyInfo": "",
        "DeliveryInfo": "",
        "DeliveryTime": "5",
        "ProductNote": "<h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><b style=transition: none 0s ease 0s;>Diriliş Ertuğrul Dizisi Osman Bey Zihgir Yüzüğü (Küçük Boy) Ürün Özellikleri</b></span></h2><ul style=transition: none 0s ease 0s; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; list-style-type: none; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>925 ayar gümüşle üretilmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Ağırlık yaklaşık 21 gr. Yüzük üst yüzey 3,5 cm</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>3 hilal tasarım ortasında güneş motifi işlenmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Yüzük içinde TRT, Diriliş Ertuğrul ve Anı Yüzük logosu yer almaktadır.</span></li></ul><h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Tüm dünyada 60dan fazla ülkede izlenen ve milyonların beğenisini kazanan Diriliş Ertuğrul dizisi lisanslı ürünleri sadece Anı Yüzükte sizi bekliyor.</span></h2><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>TRT1’de ekrana gelen ve 5 sezondur Çarşamba günlerinin lideri olan “Diriliş Ertuğrul dizisi yeni sezonda bambaşka bir konseptle izleyici karşısına çıkmaya hazırlanıyor. <br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;>Başrollerinde Engin Altan Düzyatan, Esra Bilgiç, Cengiz Coşkun ve Hülya Darcan gibi oyuncuların yer aldığı Diriliş Ertuğrul yalnızca etkili hikayesi ve oyuncularıyla değil aynı zamanda dizide kullanılan aksesuarlarla da pek çok kişinin beğenisini kazandı.</span><br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Osmanın parmağında taşıdığı baş parmak zihgir yüzüğü, dizinin yeni hikayesine uygun olarak Anı Yüzük tarafından yeniden tasarlandı. </span></p><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><br style=transition: none 0s ease 0s;>Diriliş ruhunu üzerinde taşımak isteyenler siz de diziyle aynı anda satışa çıkacak bu lisanslı ürüne yalnızca Anı Yüzük sponsorluğu ile sahip olabilirsiniz.</span></p>",
        "Document": "",
        "Warehouse": "",
        "PersonalizationId": "0",
        "SeoTitle": "Resurrection Ertugrul Series silver ring for men 925 ottoman design",
        "SeoDescription": "",
        "Gtip": "",
        "CountryOfOrigin": "TR",
        "Categories": [
            {
                "CategoryId": "97",
                "CategoryCode": "T36"
            }
        ],
        "ImageUrls": [
            {
                "ImageUrl": "https://www.noonmar.com/Data/K/D11/458.jpg",
                "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
                "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-O.jpg",
                "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-B.jpg",
                "ListNo": 0,
                "PropertyId": 0,
                "Details": {
                    "RawSize": "",
                    "RawHeight": "",
                    "RawWidth": "",
                    "SmallSize": "",
                    "SmallWidth": "",
                    "SmallHeight": "",
                    "SmallQuality": "",
                    "MediumSize": "",
                    "MediumWidth": "",
                    "MediumHeight": "",
                    "MediumQuality": "",
                    "BigSize": "",
                    "BigWidth": "",
                    "BigHeight": "",
                    "BigQuality": ""
                }
            },
            {
                "ImageUrl": "https://www.noonmar.com/Data/K/D11/453.jpg",
                "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-K.jpg",
                "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-O.jpg",
                "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-B.jpg",
                "ListNo": 1,
                "PropertyId": 0,
                "Details": {
                    "RawSize": "",
                    "RawHeight": "",
                    "RawWidth": "",
                    "SmallSize": "",
                    "SmallWidth": "",
                    "SmallHeight": "",
                    "SmallQuality": "",
                    "MediumSize": "",
                    "MediumWidth": "",
                    "MediumHeight": "",
                    "MediumQuality": "",
                    "BigSize": "",
                    "BigWidth": "",
                    "BigHeight": "",
                    "BigQuality": ""
                }
            },
            {
                "ImageUrl": "https://www.noonmar.com/Data/K/D11/454.jpg",
                "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-K.jpg",
                "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-O.jpg",
                "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-B.jpg",
                "ListNo": 2,
                "PropertyId": 0,
                "Details": {
                    "RawSize": "",
                    "RawHeight": "",
                    "RawWidth": "",
                    "SmallSize": "",
                    "SmallWidth": "",
                    "SmallHeight": "",
                    "SmallQuality": "",
                    "MediumSize": "",
                    "MediumWidth": "",
                    "MediumHeight": "",
                    "MediumQuality": "",
                    "BigSize": "",
                    "BigWidth": "",
                    "BigHeight": "",
                    "BigQuality": ""
                }
            },
            {
                "ImageUrl": "https://www.noonmar.com/Data/K/D11/455.jpg",
                "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-K.jpg",
                "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-O.jpg",
                "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-B.jpg",
                "ListNo": 3,
                "PropertyId": 0,
                "Details": {
                    "RawSize": "",
                    "RawHeight": "",
                    "RawWidth": "",
                    "SmallSize": "",
                    "SmallWidth": "",
                    "SmallHeight": "",
                    "SmallQuality": "",
                    "MediumSize": "",
                    "MediumWidth": "",
                    "MediumHeight": "",
                    "MediumQuality": "",
                    "BigSize": "",
                    "BigWidth": "",
                    "BigHeight": "",
                    "BigQuality": ""
                }
            }
        ],
        "Translation": {
            "en": {
                "ProductName": "Resurrection Ertugrul Series silver ring for men 925 ottoman design",
                "Details": "<h3>Men&#39s rings ..... add elegance to your look .... I own them with care</h3><p>Recently  great interest has appeared in wearing men&#39s rings  which give the impression of elegance and confidence  provided that they are coordinated with your appearance  so I always make sure to acquire rings of 925 sterling silver  so having one precious ring is better than having more than one ring without value. Sterling silver jewelry helps eliminate negative charges in the human body and reduces tension and stress.</p><h3>Turkish silver mens rings:</h3><p>Turkey occupied a distinguished position in the world of the silver ring for men and embodied the skill of Turkish craftsmen and high taste in designing the rings and merging them with different types of gemstones increase its beauty. We  at Noonmar  offer you a large and distinctive collection of mens rings made of sterling silver and put them in your hands to choose from them what suits your high taste and reflects your unique personality.</p><h3>Resurrection Ertuğrul Series silver ring for men 925 ottoman design:</h3><p>The series of the Artgrel Resurrection tells the story of the life of Artgrel Ibn Suleiman Shah  the father of Osman Khan  founder of the Ottoman Empire  as a tribe leader who gathered for him all the elements of the formation of a new country  to carry the banner of the Islamic conquest in moments of history in which the Islamic world suffered a state of diaspora and weakness. The production of the series began in May 2014 for five seasons and is considered a shift in Islamic drama  as it carries a lot of meanings and messages that I do not know how it has not been published yet! From the first episode  the Islamic character  which appears in all the details of the series  is observed and is not a “mere narration of history.” Rather  the writer has taken great care in choosing his words and expressions very precisely to fit perfectly with the messages he wants to communicate. Turkish drama reflects the state of pluralism in Turkish society  where the conflict between the Islamic identity and the Western passion is the series came as an  artistic  response to the series Harem Al-Sultan.</p><h3>What are the features of the Resurrection Ertuğrul Series silver ring for men 925 Simple design?</h3><ol><li>It is produced with 925 sterling silver.</li><li>Weight approx. 21 g. Ring surface 3.5 cm</li><li>3 crescent design embroidered in the middle of the solar motif.</li><li>The ring includes the TRT  Diriliş Ertuğrul and Anı Yüzük logo.</li><li>It was produced with a simple design that reflects the meanings of courage and strength in a stylish and modern way.</li></ol><h3>Are you looking for a silver ring for men that carries the resurrection and heroism?</h3><p>We present to you the Artegral Resurrection Ring  the most beautiful silver ring for men  which was designed to reflect the story of the last season with a double-headed eagle for more glory and splendor with a modern touch waiting for you at Noonmar... Licensed products from the  Artegral Resurrection  series  which is seen in more than 60 countries around the world and who have been liked by millions  can be found only at Noonmar ... Order it now</p>",
                "Document": "",
                "ShortDescription": "",
                "WarrantyInfo": "",
                "DeliveryInfo": "",
                "SeoLink": "resurrection-ertugrul-series-silver-ring-for-men-925-ottoman-design",
                "SeoDescription": "",
                "SeoTitle": "Resurrection Ertugrul Series silver ring for men 925 ottoman design",
                "Additional1": "",
                "Additional2": "",
                "Additional3": "",
                "Additional4": "",
                "Additional5": "",
                "DefaultCategoryName": "Men's Rings",
                "StockUnit": "Peice",
                "Brand": "Anı Yüzük",
                "Model": "Erkek Yüzükler",
                "BrandLink": "ani-yuzuk"
            }
        },
        "RelatedProductsBlock1": "",
        "RelatedProductsBlock2": "",
        "RelatedProductsBlock3": "",
        "SubProducts": [
            {
                "SubProductId": "1152",
                "SubProductCode": "T1152",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "24",
                "Property2": "",
                "PropertyId1": "324",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914676",
                "UpdateDate": "2023-04-19T17:31:16Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1153",
                "SubProductCode": "T1153",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "25",
                "Property2": "",
                "PropertyId1": "1465",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914676",
                "UpdateDate": "2023-04-19T17:31:16Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1154",
                "SubProductCode": "T1154",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "26",
                "Property2": "",
                "PropertyId1": "496",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914676",
                "UpdateDate": "2023-04-19T17:31:16Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1155",
                "SubProductCode": "T1155",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "27",
                "Property2": "",
                "PropertyId1": "497",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914676",
                "UpdateDate": "2023-04-19T17:31:16Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1156",
                "SubProductCode": "T1156",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "28",
                "Property2": "",
                "PropertyId1": "498",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914676",
                "UpdateDate": "2023-04-19T17:31:16Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1157",
                "SubProductCode": "T1157",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "29",
                "Property2": "",
                "PropertyId1": "499",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1158",
                "SubProductCode": "T1158",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "30",
                "Property2": "",
                "PropertyId1": "188",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "2022-03-09 08:30:32",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1159",
                "SubProductCode": "T1159",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "31",
                "Property2": "",
                "PropertyId1": "190",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1160",
                "SubProductCode": "T1160",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "32",
                "Property2": "",
                "PropertyId1": "189",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1161",
                "SubProductCode": "T1161",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "16",
                "Property2": "",
                "PropertyId1": "1466",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1162",
                "SubProductCode": "T1162",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "22",
                "Property2": "",
                "PropertyId1": "321",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "99",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "2023-07-06 11:37:31",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1165",
                "SubProductCode": "T1165",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "14",
                "Property2": "",
                "PropertyId1": "1467",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "2022-06-10 08:23:41",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1166",
                "SubProductCode": "T1166",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "15",
                "Property2": "",
                "PropertyId1": "1468",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1167",
                "SubProductCode": "T1167",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "17",
                "Property2": "",
                "PropertyId1": "1469",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1168",
                "SubProductCode": "T1168",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "18",
                "Property2": "",
                "PropertyId1": "323",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "2022-11-18 08:36:46",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1169",
                "SubProductCode": "T1169",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "19",
                "Property2": "",
                "PropertyId1": "1470",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1170",
                "SubProductCode": "T1170",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "20",
                "Property2": "",
                "PropertyId1": "322",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1171",
                "SubProductCode": "T1171",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "21",
                "Property2": "",
                "PropertyId1": "1471",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            },
            {
                "SubProductId": "1172",
                "SubProductCode": "T1172",
                "MainProductId": "110",
                "Barcode": "DİRİLİŞ-0297-D",
                "Property1": "23",
                "Property2": "",
                "PropertyId1": "1472",
                "PropertyId2": "0",
                "Property1ListNo": "0",
                "Property2ListNo": null,
                "Stock": "100",
                "CBM": "0",
                "Weight": "0.11",
                "SupplierSubProductCode": null,
                "BuyingPrice": "0",
                "SellingPrice": "0",
                "DiscountedSellingPrice": "0",
                "VendorSellingPrice": "0",
                "IsActive": "true",
                "AddingDate": "0",
                "CreateDateTimeStamp": "0",
                "CreateDate": "1970-01-01T02:00:00Z",
                "UpdateDateTimeStamp": "1681914677",
                "UpdateDate": "2023-04-19T17:31:17Z",
                "HasImage": "true",
                "OwnerId": "0",
                "OwnerName": "",
                "Point": "0",
                "StockUpdateDate": "0000-00-00 00:00:00",
                "PriceUpdateDate": "0000-00-00 00:00:00"
            }
        ]
    }
];
const tempTrData = [
  {
      "ProductId": "110",
      "ProductCode": "T229",
      "ProductName": "Diriliş Ertuğrul Dizisi Osman Zihgir Yüzüğü",
      "DefaultCategoryId": "97",
      "DefaultCategoryName": "Erkek Yüzükler",
      "DefaultCategoryPath": "Takı Ve Aksesuar > Erkek Takıları > ",
      "SupplierProductCode": "8682336096326",
      "Barcode": "663113002295",
      "Stock": "1899",
      "IsActive": "true",
      "IsApproved": "true",
      "HasSubProducts": "true",
      "ComparisonSites": "false",
      "Vat": "0",
      "CurrencyId": "1",
      "BuyingPrice": "42.34201954",
      "SellingPrice": "71.98143322",
      "DiscountedPrice": "0",
      "SellingPriceVatIncludedNoDiscount": "71.98143322",
      "SellingPriceVatIncluded": "2208.89",
      "SeoLink": "dirilis-ertugrul-dizisi-osman-zihgir-yuzugu",
      "StockUnit": "Adet",
      "StockUnitId": "1",
      "SearchKeywords": "",
      "DisplayOnHomepage": "true",
      "IsNewProduct": "true",
      "OnSale": "true",
      "IsDisplayProduct": "false",
      "VendorDisplayOnly": "false",
      "DisplayWithVat": "true",
      "Brand": "Anı Yüzük",
      "BrandId": "14",
      "BrandLink": "ani-yuzuk",
      "Model": "Erkek Yüzükler",
      "ModelId": "13",
      "SupplierId": "23",
      "CustomerGroupDisplay": "-0---1---2--3-",
      "ImageUrl": "/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
      "Magnifier": "true",
      "MemberMinOrder": "0",
      "MemberMaxOrder": "0",
      "VendorMinOrder": "0",
      "VendorMaxOrder": "0",
      "ShortDescription": "",
      "SavingDate": "2021-07-05 16:14:05",
      "CreateDateTimeStamp": "1625490845",
      "CreateDate": "2021-07-05T16:14:05Z",
      "FilterGroupId": "0",
      "ListNo": "9815",
      "OwnerId": "0",
      "UpdateDate": "2024-02-13 00:18:01",
      "StockUpdateDate": "2023-07-06 11:37:31",
      "PriceUpdateDate": "2024-02-12 17:12:00",
      "IsActiveUpdateDate": "0000-00-00 00:00:00",
      "StockUpdatePlatform": "user",
      "PriceUpdatePlatform": "cron",
      "IsActiveUpdatePlatform": "",
      "Gender": "0",
      "OpportunityProduct": "0",
      "OpportunityStart": "0",
      "OpportunityFinish": "0",
      "AgeGroup": "",
      "CommentRate": "0",
      "CommentCount": "0",
      "DisablePaymentTypes": null,
      "DisableCargoCompany": "14",
      "StatViews": "9678",
      "StatRecommendations": "0",
      "HomepageSort": "0",
      "MostSoldSort": "0",
      "NewestSort": "0",
      "Point": "0",
      "EftRate": "0",
      "Numeric1": "0.0000",
      "HasImages": "true",
      "DefaultSubProductId": "0",
      "RelatedProductsIds1": "",
      "RelatedProductsIds2": "",
      "RelatedProductsIds3": "",
      "FreeDeliveryMember": "0",
      "FreeDeliveryVendor": "0",
      "FreeDeliveryForProduct": "0",
      "SearchRank": "0",
      "VariantFeature1Title": "Beden",
      "VariantFeature2Title": "Renk",
      "CountTotalSales": "2",
      "Label1": {
          "Name": "Free Shipping",
          "Value": 0
      },
      "Label2": {
          "Name": "Free Shpping",
          "Value": 0
      },
      "Label3": {
          "Name": "Kampanyalı Ürün",
          "Value": 0
      },
      "Label4": {
          "Name": "Aynı Gün Kargo",
          "Value": 0
      },
      "Label5": {
          "Name": "",
          "Value": 0
      },
      "Label6": {
          "Name": "",
          "Value": 0
      },
      "Label7": {
          "Name": "",
          "Value": 0
      },
      "Label8": {
          "Name": "",
          "Value": 0
      },
      "Label9": {
          "Name": "",
          "Value": 0
      },
      "Label10": {
          "Name": "En Çok Satan",
          "Value": 0
      },
      "Additional1": "",
      "Additional2": "",
      "Additional3": "",
      "Additional4": "",
      "Additional5": "",
      "Currency": "USD",
      "Supplier": "Anı Hediyelik Ve Aksesuar Limited Şirketi",
      "DefaultCategoryCode": "T36",
      "ImageUrlCdn": "",
      "Details": "<h2 none=\"\" 0s=\"\" ease=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span><b none=\"\" 0s=\"\" ease=\"\">Diriliş Ertuğrul Dizisi Osman Bey Zihgir Yüzüğü (Küçük Boy) Ürün Özellikleri</b></span></h2><ul none=\"\" 0s=\"\" ease=\"\" margin-right:=\"\" 0px=\"\" margin-bottom:=\"\" margin-left:=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" list-style-type:=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>925 ayar gümüşle üretilmiştir.</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>Ağırlık yaklaşık 21 gr. Yüzük üst yüzey 3,5 cm</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>3 hilal tasarım ortasında güneş motifi işlenmiştir.</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>Yüzük içinde TRT, Diriliş Ertuğrul ve Anı Yüzük logosu yer almaktadır.</span></li></ul><h2 none=\"\" 0s=\"\" ease=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span>Tüm dünyada 60dan fazla ülkede izlenen ve milyonların beğenisini kazanan Diriliş Ertuğrul dizisi lisanslı ürünleri sadece Anı Yüzükte sizi bekliyor.</span></h2><p none=\"\" 0s=\"\" ease=\"\" margin-bottom:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span>TRT1’de ekrana gelen ve 5 sezondur Çarşamba günlerinin lideri olan “Diriliş Ertuğrul dizisi yeni sezonda bambaşka bir konseptle izleyici karşısına çıkmaya hazırlanıyor. <br none=\"\" 0s=\"\" ease=\"\" /><br none=\"\" 0s=\"\" ease=\"\" />Başrollerinde Engin Altan Düzyatan, Esra Bilgiç, Cengiz Coşkun ve Hülya Darcan gibi oyuncuların yer aldığı Diriliş Ertuğrul yalnızca etkili hikayesi ve oyuncularıyla değil aynı zamanda dizide kullanılan aksesuarlarla da pek çok kişinin beğenisini kazandı.</span><br none=\"\" 0s=\"\" ease=\"\" /><br none=\"\" 0s=\"\" ease=\"\" /><span>Osmanın parmağında taşıdığı baş parmak zihgir yüzüğü, dizinin yeni hikayesine uygun olarak Anı Yüzük tarafından yeniden tasarlandı. </span></p><p none=\"\" 0s=\"\" ease=\"\" margin-bottom:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span><br none=\"\" 0s=\"\" ease=\"\" />Diriliş ruhunu üzerinde taşımak isteyenler siz de diziyle aynı anda satışa çıkacak bu lisanslı ürüne yalnızca Anı Yüzük sponsorluğu ile sahip olabilirsiniz.</span></p>",
      "Width": "8",
      "Height": "8",
      "Depth": "8",
      "Weight": "0.12",
      "CBM": "0",
      "WarrantyInfo": "",
      "DeliveryInfo": "",
      "DeliveryTime": "5",
      "ProductNote": "<h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><b style=transition: none 0s ease 0s;>Diriliş Ertuğrul Dizisi Osman Bey Zihgir Yüzüğü (Küçük Boy) Ürün Özellikleri</b></span></h2><ul style=transition: none 0s ease 0s; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; list-style-type: none; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>925 ayar gümüşle üretilmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Ağırlık yaklaşık 21 gr. Yüzük üst yüzey 3,5 cm</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>3 hilal tasarım ortasında güneş motifi işlenmiştir.</span></li><li style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: inherit; line-height: 15px; font-family: inherit; vertical-align: baseline; top: 20px; left: 20px; right: 20px; list-style: inside disc;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Yüzük içinde TRT, Diriliş Ertuğrul ve Anı Yüzük logosu yer almaktadır.</span></li></ul><h2 style=transition: none 0s ease 0s; font-family: Montserrat, sans-serif; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Tüm dünyada 60dan fazla ülkede izlenen ve milyonların beğenisini kazanan Diriliş Ertuğrul dizisi lisanslı ürünleri sadece Anı Yüzükte sizi bekliyor.</span></h2><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>TRT1’de ekrana gelen ve 5 sezondur Çarşamba günlerinin lideri olan “Diriliş Ertuğrul dizisi yeni sezonda bambaşka bir konseptle izleyici karşısına çıkmaya hazırlanıyor. <br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;>Başrollerinde Engin Altan Düzyatan, Esra Bilgiç, Cengiz Coşkun ve Hülya Darcan gibi oyuncuların yer aldığı Diriliş Ertuğrul yalnızca etkili hikayesi ve oyuncularıyla değil aynı zamanda dizide kullanılan aksesuarlarla da pek çok kişinin beğenisini kazandı.</span><br style=transition: none 0s ease 0s;><br style=transition: none 0s ease 0s;><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;>Osmanın parmağında taşıdığı baş parmak zihgir yüzüğü, dizinin yeni hikayesine uygun olarak Anı Yüzük tarafından yeniden tasarlandı. </span></p><p style=transition: none 0s ease 0s; margin-bottom: 0px; padding: 0px; border: 0px; font-variant-numeric: inherit; font-variant-east-asian: inherit; font-stretch: inherit; font-size: 13px; line-height: inherit; font-family: Montserrat, sans-serif; vertical-align: baseline; color: rgb(0, 0, 0); background-color: rgb(251, 251, 251);><span style=transition: none 0s ease 0s; margin: 0px; padding: 0px; border: 0px; font-style: inherit; font-variant: inherit; font-weight: inherit; font-stretch: inherit; font-size: 12pt; line-height: inherit; font-family: helvetica, arial, sans-serif; vertical-align: baseline;><br style=transition: none 0s ease 0s;>Diriliş ruhunu üzerinde taşımak isteyenler siz de diziyle aynı anda satışa çıkacak bu lisanslı ürüne yalnızca Anı Yüzük sponsorluğu ile sahip olabilirsiniz.</span></p>",
      "Document": "",
      "Warehouse": "",
      "PersonalizationId": "0",
      "SeoTitle": "Takı Ve Aksesuar",
      "SeoDescription": "",
      "Gtip": "",
      "CountryOfOrigin": "TR",
      "Categories": [
          {
              "CategoryId": "97",
              "CategoryCode": "T36"
          }
      ],
      "ImageUrls": [
          {
              "ImageUrl": "https://www.noonmar.com/Data/K/D11/458.jpg",
              "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-K.jpg",
              "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-O.jpg",
              "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-458-11-B.jpg",
              "ListNo": 0,
              "PropertyId": 0,
              "Details": {
                  "RawSize": "",
                  "RawHeight": "",
                  "RawWidth": "",
                  "SmallSize": "",
                  "SmallWidth": "",
                  "SmallHeight": "",
                  "SmallQuality": "",
                  "MediumSize": "",
                  "MediumWidth": "",
                  "MediumHeight": "",
                  "MediumQuality": "",
                  "BigSize": "",
                  "BigWidth": "",
                  "BigHeight": "",
                  "BigQuality": ""
              }
          },
          {
              "ImageUrl": "https://www.noonmar.com/Data/K/D11/453.jpg",
              "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-K.jpg",
              "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-O.jpg",
              "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-453-11-B.jpg",
              "ListNo": 1,
              "PropertyId": 0,
              "Details": {
                  "RawSize": "",
                  "RawHeight": "",
                  "RawWidth": "",
                  "SmallSize": "",
                  "SmallWidth": "",
                  "SmallHeight": "",
                  "SmallQuality": "",
                  "MediumSize": "",
                  "MediumWidth": "",
                  "MediumHeight": "",
                  "MediumQuality": "",
                  "BigSize": "",
                  "BigWidth": "",
                  "BigHeight": "",
                  "BigQuality": ""
              }
          },
          {
              "ImageUrl": "https://www.noonmar.com/Data/K/D11/454.jpg",
              "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-K.jpg",
              "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-O.jpg",
              "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-454-11-B.jpg",
              "ListNo": 2,
              "PropertyId": 0,
              "Details": {
                  "RawSize": "",
                  "RawHeight": "",
                  "RawWidth": "",
                  "SmallSize": "",
                  "SmallWidth": "",
                  "SmallHeight": "",
                  "SmallQuality": "",
                  "MediumSize": "",
                  "MediumWidth": "",
                  "MediumHeight": "",
                  "MediumQuality": "",
                  "BigSize": "",
                  "BigWidth": "",
                  "BigHeight": "",
                  "BigQuality": ""
              }
          },
          {
              "ImageUrl": "https://www.noonmar.com/Data/K/D11/455.jpg",
              "Small": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-K.jpg",
              "Medium": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-O.jpg",
              "Big": "https://www.noonmar.com/dirilis-ertugrul-dizisi-osman-zihgir-yuzugu-455-11-B.jpg",
              "ListNo": 3,
              "PropertyId": 0,
              "Details": {
                  "RawSize": "",
                  "RawHeight": "",
                  "RawWidth": "",
                  "SmallSize": "",
                  "SmallWidth": "",
                  "SmallHeight": "",
                  "SmallQuality": "",
                  "MediumSize": "",
                  "MediumWidth": "",
                  "MediumHeight": "",
                  "MediumQuality": "",
                  "BigSize": "",
                  "BigWidth": "",
                  "BigHeight": "",
                  "BigQuality": ""
              }
          }
      ],
      "Translation": {
          "tr": {
              "ProductName": "Diriliş Ertuğrul Dizisi Osman Zihgir Yüzüğü",
              "Details": "<h2 none=\"\" 0s=\"\" ease=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span><b none=\"\" 0s=\"\" ease=\"\">Diriliş Ertuğrul Dizisi Osman Bey Zihgir Yüzüğü (Küçük Boy) Ürün Özellikleri</b></span></h2><ul none=\"\" 0s=\"\" ease=\"\" margin-right:=\"\" 0px=\"\" margin-bottom:=\"\" margin-left:=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" list-style-type:=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>925 ayar gümüşle üretilmiştir.</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>Ağırlık yaklaşık 21 gr. Yüzük üst yüzey 3,5 cm</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>3 hilal tasarım ortasında güneş motifi işlenmiştir.</span></li><li none=\"\" 0s=\"\" ease=\"\" margin:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-style:=\"\" inherit=\"\" font-variant:=\"\" font-weight:=\"\" font-stretch:=\"\" font-size:=\"\" line-height:=\"\" 15px=\"\" font-family:=\"\" vertical-align:=\"\" baseline=\"\" top:=\"\" 20px=\"\" left:=\"\" right:=\"\" list-style:=\"\" inside=\"\" disc=\"\"><span>Yüzük içinde TRT, Diriliş Ertuğrul ve Anı Yüzük logosu yer almaktadır.</span></li></ul><h2 none=\"\" 0s=\"\" ease=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span>Tüm dünyada 60dan fazla ülkede izlenen ve milyonların beğenisini kazanan Diriliş Ertuğrul dizisi lisanslı ürünleri sadece Anı Yüzükte sizi bekliyor.</span></h2><p none=\"\" 0s=\"\" ease=\"\" margin-bottom:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span>TRT1’de ekrana gelen ve 5 sezondur Çarşamba günlerinin lideri olan “Diriliş Ertuğrul dizisi yeni sezonda bambaşka bir konseptle izleyici karşısına çıkmaya hazırlanıyor. <br none=\"\" 0s=\"\" ease=\"\" /><br none=\"\" 0s=\"\" ease=\"\" />Başrollerinde Engin Altan Düzyatan, Esra Bilgiç, Cengiz Coşkun ve Hülya Darcan gibi oyuncuların yer aldığı Diriliş Ertuğrul yalnızca etkili hikayesi ve oyuncularıyla değil aynı zamanda dizide kullanılan aksesuarlarla da pek çok kişinin beğenisini kazandı.</span><br none=\"\" 0s=\"\" ease=\"\" /><br none=\"\" 0s=\"\" ease=\"\" /><span>Osmanın parmağında taşıdığı baş parmak zihgir yüzüğü, dizinin yeni hikayesine uygun olarak Anı Yüzük tarafından yeniden tasarlandı. </span></p><p none=\"\" 0s=\"\" ease=\"\" margin-bottom:=\"\" 0px=\"\" padding:=\"\" border:=\"\" font-variant-numeric:=\"\" inherit=\"\" font-variant-east-asian:=\"\" font-stretch:=\"\" font-size:=\"\" 13px=\"\" line-height:=\"\" font-family:=\"\" montserrat=\"\" sans-serif=\"\" vertical-align:=\"\" baseline=\"\" color:=\"\" rgb=\"\" 0=\"\" background-color:=\"\" 251=\"\"><span><br none=\"\" 0s=\"\" ease=\"\" />Diriliş ruhunu üzerinde taşımak isteyenler siz de diziyle aynı anda satışa çıkacak bu lisanslı ürüne yalnızca Anı Yüzük sponsorluğu ile sahip olabilirsiniz.</span></p>",
              "Document": "",
              "ShortDescription": "",
              "WarrantyInfo": "",
              "DeliveryInfo": "",
              "SeoLink": "dirilis-ertugrul-dizisi-osman-zihgir-yuzugu",
              "SeoDescription": "",
              "SeoTitle": "Takı Ve Aksesuar",
              "Additional1": "",
              "Additional2": "",
              "Additional3": "",
              "Additional4": "",
              "Additional5": "",
              "DefaultCategoryName": "Erkek Yüzükler",
              "StockUnit": "Adet",
              "Brand": "Anı Yüzük",
              "Model": "Erkek Yüzükler",
              "BrandLink": "ani-yuzuk"
          }
      },
      "RelatedProductsBlock1": "",
      "RelatedProductsBlock2": "",
      "RelatedProductsBlock3": "",
      "SubProducts": [
          {
              "SubProductId": "1152",
              "SubProductCode": "T1152",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "24",
              "Property2": "",
              "PropertyId1": "324",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914676",
              "UpdateDate": "2023-04-19T17:31:16Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1153",
              "SubProductCode": "T1153",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "25",
              "Property2": "",
              "PropertyId1": "1465",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914676",
              "UpdateDate": "2023-04-19T17:31:16Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1154",
              "SubProductCode": "T1154",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "26",
              "Property2": "",
              "PropertyId1": "496",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914676",
              "UpdateDate": "2023-04-19T17:31:16Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1155",
              "SubProductCode": "T1155",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "27",
              "Property2": "",
              "PropertyId1": "497",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914676",
              "UpdateDate": "2023-04-19T17:31:16Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1156",
              "SubProductCode": "T1156",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "28",
              "Property2": "",
              "PropertyId1": "498",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914676",
              "UpdateDate": "2023-04-19T17:31:16Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1157",
              "SubProductCode": "T1157",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "29",
              "Property2": "",
              "PropertyId1": "499",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1158",
              "SubProductCode": "T1158",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "30",
              "Property2": "",
              "PropertyId1": "188",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "2022-03-09 08:30:32",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1159",
              "SubProductCode": "T1159",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "31",
              "Property2": "",
              "PropertyId1": "190",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1160",
              "SubProductCode": "T1160",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "32",
              "Property2": "",
              "PropertyId1": "189",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1161",
              "SubProductCode": "T1161",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "16",
              "Property2": "",
              "PropertyId1": "1466",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1162",
              "SubProductCode": "T1162",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "22",
              "Property2": "",
              "PropertyId1": "321",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "99",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "2023-07-06 11:37:31",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1165",
              "SubProductCode": "T1165",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "14",
              "Property2": "",
              "PropertyId1": "1467",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "2022-06-10 08:23:41",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1166",
              "SubProductCode": "T1166",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "15",
              "Property2": "",
              "PropertyId1": "1468",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1167",
              "SubProductCode": "T1167",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "17",
              "Property2": "",
              "PropertyId1": "1469",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1168",
              "SubProductCode": "T1168",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "18",
              "Property2": "",
              "PropertyId1": "323",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "2022-11-18 08:36:46",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1169",
              "SubProductCode": "T1169",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "19",
              "Property2": "",
              "PropertyId1": "1470",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1170",
              "SubProductCode": "T1170",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "20",
              "Property2": "",
              "PropertyId1": "322",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1171",
              "SubProductCode": "T1171",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "21",
              "Property2": "",
              "PropertyId1": "1471",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          },
          {
              "SubProductId": "1172",
              "SubProductCode": "T1172",
              "MainProductId": "110",
              "Barcode": "DİRİLİŞ-0297-D",
              "Property1": "23",
              "Property2": "",
              "PropertyId1": "1472",
              "PropertyId2": "0",
              "Property1ListNo": "0",
              "Property2ListNo": null,
              "Stock": "100",
              "CBM": "0",
              "Weight": "0.11",
              "SupplierSubProductCode": null,
              "BuyingPrice": "0",
              "SellingPrice": "0",
              "DiscountedSellingPrice": "0",
              "VendorSellingPrice": "0",
              "IsActive": "true",
              "AddingDate": "0",
              "CreateDateTimeStamp": "0",
              "CreateDate": "1970-01-01T02:00:00Z",
              "UpdateDateTimeStamp": "1681914677",
              "UpdateDate": "2023-04-19T17:31:17Z",
              "HasImage": "true",
              "OwnerId": "0",
              "OwnerName": "",
              "Point": "0",
              "StockUpdateDate": "0000-00-00 00:00:00",
              "PriceUpdateDate": "0000-00-00 00:00:00"
          }
      ]
  }
]

    // const enData = await fetchProducts("en");
    // console.log("enData finsihed", enData.length);
    // const arData = await fetchProducts("ar");
    // console.log("arData finsihed", arData.length);
    // const trData = await fetchProducts("tr");
    // console.log("trData finsihed", trData.length);
    // const [enData, arData, trData] = await Promise.all(languages.map(fetchProducts));

    await updateProducts(tempEnData, tempArData, tempTrData);
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
          console.log(variant);
          await SubVariant.findOneAndUpdate(
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
        }
      }
      start += limit;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
