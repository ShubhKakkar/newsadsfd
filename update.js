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

        // Fetching necessary details from database
        const customIdPromise = idCreator("product", false);
        const categoryPromise = ProductCategory.findOne({
          categoryId: product.DefaultCategoryId,
        });
        const brandPromise = Brand.findOne({
          brandId: product.BrandId,
        });
        const unitPromise = Unit.findOne({
          stockUnitId: product.StockUnitId,
        });
        const buyingPriceCurrencyPromise = Currency.findOne({
          code: product.Currency,
        });
        const shippingCompanyPromise = ShippingCompany.findOne({
          name: defaultShippingCompany,
        });

        const [
          customId,
          category,
          brand,
          unit,
          buyingPriceCurrency,
          shippingCompany,
        ] = await Promise.all([
          customIdPromise,
          categoryPromise,
          brandPromise,
          unitPromise,
          buyingPriceCurrencyPromise,
          shippingCompanyPromise,
        ]);

        if (!buyingPriceCurrency) {
          buyingPriceCurrency = {
            _id: new ObjectId("657c3c8f3e28674d584dfe1e"),
          };
        }

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

        const alternateProductIds = await Promise.all(
          alternateProucts.map(async (alternateProduct) => {
            try {
              const foundProduct = await Product.findOne({
                productId: alternateProduct,
              });

              return foundProduct ? foundProduct._id : null;
            } catch (error) {
              console.error(`Error finding product with productId ${alternateProduct}: ${error.message}`);
              return null;
            }
          })
        );

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
            console.log(subVariant1);
            variant1 = await Variant.findOne({
              groupId: subVariant1.groupId,
            });
            variantsArray.push(variant1);
          }

          if (propertyId2 && propertyId2 !== "") {
            subVariant2 = await SubVariant.findOne({
              propertyId: propertyId2,
            });
            console.log(subVariant2);
            variant2 = await Variant.findOne({
              groupId: subVariant2.groupId,
            });
            variantsArray.push(variant2);
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
                slug: `${enProductDescription.slug}-en-${updatedProductVariant.firstSubVariantName.split(" ")[0] || uuidv4()
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
                slug: `${arProductDescription.slug}-ar-${updatedProductVariant.firstSubVariantName.split(" ")[0]
                || uuidv4()  }`,
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
                slug: `${trProductDescription.slug}-tr-${updatedProductVariant.firstSubVariantName.split(" ")[0]
                || uuidv4()  }`,
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
                variantId: transformedArray[transformedArray.length - 1].id,
              },
            }
          );
        }

        round += 1;
      }
    }
    catch (err) {
      console.log(err);
    }
  };
  try {
    const fetchProducts = async (languageCode, start = 584, limit = 500) => {
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
        languages.map(language => fetchProducts(language))
      );

      console.log(`enData length: ${enData.length}, arData length: ${arData.length}, trData length: ${trData.length}`);

      await updateProducts(enData, arData, trData);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(async (db) => {
    console.log("MongoDB Connected.!");
    // Assuming you have Mongoose models for your collections
    const Product = require('./models/product.js'); // Replace with your actual path
    const ProductVariant = require('./models/productVariant.js'); // Replace with your actual path
    const ProductDescription = require('./models/productDescription.js'); // Replace with your actual path
    const VendorProduct = require('./models/vendorProduct.js'); // Replace with your actual path
    const VendorProductVariant = require('./models/vendorProductVariant.js'); // Replace with your actual path

    // Define the indexes for the Product collection
    await Product.createIndexes([
      { productId: 1 },
      { customId: 1 },
      { categoryId: 1 },
      { brandId: 1 },
      // Add more indexes as needed
    ]);

    // Define the indexes for the ProductVariant collection
    await ProductVariant.createIndexes([
      { subProductId: 1 },
      { mainProductId: 1 },
      // Add more indexes as needed
    ]);

    // Define the indexes for the ProductDescription collection
    await ProductDescription.createIndexes([
      { productId: 1, languageCode: 1 },
      // Add more indexes as needed
    ]);

    // Define the indexes for the VendorProduct collection
    await VendorProduct.createIndexes([
      { vendorId: 1, productId: 1 },
      // Add more indexes as needed
    ]);

    // Define the indexes for the VendorProductVariant collection
    await VendorProductVariant.createIndexes([
      { vendorId: 1, mainProductId: 1, productVariantId: 1 },
      // Add more indexes as needed
    ]);
    const server = app.listen(7008);
  })
