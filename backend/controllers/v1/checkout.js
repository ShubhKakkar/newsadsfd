const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../../http-error");
const {
  translateHelper,
  currentAndUSDCurrencyData,
  getCurrencyDataByCode,
  getCountryByName,
} = require("../../utils/helper");
const { PRODUCT_PRICING, CART_CHECKOUT } = require("../../utils/aggregate");

const Cart = require("../../models/cart");
const List = require("../../models/list");
const Address = require("../../models/address");
const Tax = require("../../models/tax");

exports.getTaxData = async (req, res, next) => {
  let countryId = req.countryId;
  //   let languageCode = req.languageCode;
  let userId = req.customerId;

  const { billingAddressId } = req.body;

  if (!billingAddressId) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide billing address",
      422
    );
    return next(error);
  }

  let addressData, cartItems, currentCurrency;

  try {
    addressData = await Address.findOne({
      _id: ObjectId(billingAddressId),
      customerId: ObjectId(userId),
    })
      .lean()
      .select("countryId");

    if (!addressData) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Invalid billing address",
        422
      );
      return next(error);
    }

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    currentCurrency = currenciesData.currentCurrency;
    const usdCurrency = currenciesData.usdCurrency;

    cartItems = await Cart.aggregate(
      CART_CHECKOUT(userId, countryId, currentCurrency, usdCurrency)
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

  const categoryWithPrice = cartItems.reduce((acc, cv) => {
    if (acc[cv.categoryId]) {
      acc[cv.categoryId] = acc[cv.categoryId] + cv.totalPrice;
    } else {
      acc[cv.categoryId] = cv.totalPrice;
    }

    return acc;
  }, {});

  const categories = Object.keys(categoryWithPrice);

  let taxes;

  try {
    taxes = await Tax.aggregate([
      {
        $match: {
          countryId: new ObjectId(addressData.countryId),
        },
      },
      {
        $unwind: {
          path: "$taxes",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$taxes",
        },
      },
      {
        $match: {
          subCategory: {
            $in: categories.map((c) => ObjectId(c)),
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

  let taxAmount = 0;

  taxes.forEach((t) => {
    taxAmount += +((categoryWithPrice[t.subCategory] * t.tax) / 100).toFixed(2);
  });

  res.status(200).json({ status: true, taxAmount });
};

exports.getCustomData = async (req, res, next) => {
  let countryId = req.countryId;
  //   let languageCode = req.languageCode;
  let userId = req.customerId;

  const { shippingAddressId } = req.body;

  if (!shippingAddressId) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide billing address",
      422
    );
    return next(error);
  }

  let vendorCountryData,
    shippingAddressData,
    cartItems,
    currentCurrency,
    usdCurrency;

  try {
    vendorCountryData = getCountryByName("Turkey");

    shippingAddressData = Address.aggregate([
      {
        $match: {
          _id: new ObjectId(shippingAddressId),
          customerId: new ObjectId(userId),
        },
      },
      {
        $project: {
          countryId: 1,
        },
      },
      {
        $lookup: {
          from: "countries",
          let: {
            id: "$countryId",
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
                countryCode: 1,
                currency: 1,
                customCell: 1,
                customCurrency: 1,
                customFixedValue: 1,
                customPercentageValue: 1,
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
        $lookup: {
          from: "currencies",
          let: {
            id: "$countryData.customCurrency",
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
                code: 1,
                sign: 1,
                exchangeRate: 1,
              },
            },
          ],
          as: "customCurrencyData",
        },
      },
      {
        $project: {
          countryData: 1,
          customCurrencyData: {
            $arrayElemAt: ["$customCurrencyData", 0],
          },
        },
      },
    ]);

    [vendorCountryData, [shippingAddressData]] = await Promise.all([
      vendorCountryData,
      shippingAddressData,
    ]);

    if (!vendorCountryData.status) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Could not able to fetch vendor country data",
        500
      );
      return next(error);
    }

    if (!shippingAddressData) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Invalid shipping address",
        422
      );
      return next(error);
    }

    if (vendorCountryData.country._id == shippingAddressData.countryData._id) {
      return res.status(200).json({ status: true, customFees: 0 });
    }

    const currenciesData = await currentAndUSDCurrencyData(countryId);

    currentCurrency = currenciesData.currentCurrency;
    usdCurrency = currenciesData.usdCurrency;

    cartItems = await Cart.aggregate(
      CART_CHECKOUT(userId, countryId, currentCurrency, usdCurrency)
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

  let totalPrice = cartItems.reduce((acc, cv) => acc + cv.totalPrice, 0);
  totalPrice = +totalPrice.toFixed(2);

  let shippingAddressPrice = totalPrice;

  //convert total price of cart to shipping address's customCurrency (only if they are different)
  let isCurrencyDifferent =
    shippingAddressData.customCurrencyData._id !== currentCurrency._id;
  if (isCurrencyDifferent) {
    shippingAddressPrice = +(
      (totalPrice / currentCurrency.exchangeRate) *
      shippingAddressData.customCurrencyData.exchangeRate
    ).toFixed(2);
  }

  //check shippingAddressPrice is gt customCell
  //if it is add fixed and percentage
  if (shippingAddressPrice < +shippingAddressData.countryData.customCell) {
    return res.status(200).json({ status: true, customFees: 0 });
  }

  shippingAddressPrice +=
    +shippingAddressData.countryData.customFixedValue +
    (shippingAddressPrice *
      +shippingAddressData.countryData.customPercentageValue) /
      100;

  shippingAddressPrice = +shippingAddressPrice.toFixed(2);

  //convert back to current currency value
  if (isCurrencyDifferent) {
    shippingAddressPrice = (
      (shippingAddressPrice /
        shippingAddressData.customCurrencyData.exchangeRate) *
      currentCurrency.exchangeRate
    ).toFixed(2);
  }

  return res.status(200).json({
    status: true,
    customFees: +(shippingAddressPrice - totalPrice).toFixed(2),
  });
};
