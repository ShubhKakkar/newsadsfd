const nodemailer = require("nodemailer");
const moment = require("moment");
const axios = require("axios");
const User = require("../models/user");
const ObjectId = require("mongoose").Types.ObjectId;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { promises: promiseFS } = require("fs");
const path = require("path");
const mongoose = require("mongoose");
// const Promise = require("bluebird");
const NodeGeocoder = require("node-geocoder");
const http = require("http");
const https = require("https");
const imageDownloader = require("image-downloader");
// const parser = require("xml2json");
const FCM = require("fcm-node");

// const fsPromises = require("fs/promises");
const htmlPdf = require("html-pdf");

const EmailLog = require("../models/emailLog");
const Vander = require("../models/vendor");
const Customer = require("../models/customer");
const Currency = require("../models/currency");
const ProductCategory = require("../models/productCategory");
const ProductSync = require("../models/productSync");
const Product = require("../models/product");
const HttpError = require("../http-error");
const Brand = require("../models/brand");
const Unit = require("../models/unit");
const { LOOKUP_ORDER } = require("./aggregate");
const ProductCategoryDescriptions = require("../models/productCategoryDescription");
const ProductDescription = require("../models/productDescription");
const ProductSyncHistory = require("../models/productSyncHistory");
const MasterDescription = require("../models/masterDescription");
const Country = require("../models/country");
const Cart = require("../models/cart");
const Vendor = require("../models/vendor");
const EmailTemplate = require("../models/emailTemplate");
const OrderItem = require("../models/orderItem");
const Setting = require("../models/setting");
const Transaction = require("../models/transaction");
const OrderItemStatus = require("../models/orderItemStatus");
const NotificationTemplate = require("../models/notificationTemplate");
const Notification = require("../models/notification");
const DeviceId = require("../models/deviceId");

const enLang = require("../locales/en/translation.json");
const arLang = require("../locales/ar/translation.json");
const trLang = require("../locales/tr/translation.json");

const generateToken = require("./generateToken");
const { LOOKUP_CATEGORY } = require("./aggregate");

const PORT = process.env.PORT;
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

let MONGODB_URI;

const geoOptions = {
  provider: "google",

  // Optional depending on the providers
  apiKey: "AIzaSyB72Nrng-_q3STWQuss1Lj7hLnNEmC6350", // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(geoOptions);

const decodeEntities = (encodedString) => {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">",
  };
  return encodedString
    .replace(translate_re, function (match, entity) {
      return translate[entity];
    })
    .replace(/&#(\d+);/gi, function (match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
};

const emailSend = (
  res,
  next,
  to,
  subject,
  html,
  dataToSend,
  mailDataObj = {}
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  if (to) {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      attachDataUrls: true,
      ...mailDataObj,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      let isError = false;
      console.log(err);
      // if (err) {
      //   isError = true;
      //   const error = new HttpError(
      //     { get: () => {} },
      //     new Error().stack.split("at ")[1].trim(),
      //     "Something went wrong while sending email #a",
      //     500
      //   );
      //   return next(error);
      // }

      // if (isError) {
      //   return;
      // }

      const emailLog = new EmailLog({
        from: process.env.MAIL_FROM,
        to,
        subject,
        body: html,
      });

      try {
        await emailLog.save();
      } catch (err) {
        console.log(err);
        const error = new HttpError(
          { get: () => {} },
          new Error().stack.split("at ")[1].trim(),
          "Something went wrong #b",
          500
        );
        return next(error);
      }

      if (mailDataObj && Object.keys(mailDataObj).length > 0) {
        removeFile(mailDataObj.attachments[0].path);
      }

      res.status(200).json({
        status: true,
        message: "Email successfully sent.",
        ...dataToSend,
      });
    });
  } else {
    res.status(200).json({
      status: true,
      message: "Email successfully sent.",
      ...dataToSend,
    });
  }
};

const emailSendInLoop = async (next, to, subject, html, mailDataObj = {}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
    attachDataUrls: true,
    ...mailDataObj,
  };

  transporter.sendMail(mailOptions, async (err, info) => {
    let isError = false;
    if (err) {
      isError = true;
      console.log("1", err);
      // const error = new HttpError(
      //   "Something went wrong while sending email #a",
      //   500
      // );
      // return next(error);
    }

    if (isError) {
      return;
    }

    const emailLog = new EmailLog({
      from: process.env.MAIL_FROM,
      to,
      subject,
      body: html,
    });

    if (mailDataObj && Object.keys(mailDataObj).length > 0) {
      removeFile(mailDataObj.attachments[0].path);
    }

    try {
      await emailLog.save();
    } catch (err) {
      console.log("2", err);
      // const error = new HttpError("Something went wrong #b", 500);
      // return next(error);
    }
  });
};

const fileUpload = (file, folderName) => {
  if (file == undefined) {
    return "";
  } else {
    var img = file;
    var fileName = img.name.split(".");
    var ext = fileName.pop();
    var splitName = fileName.join("");
    var uniqueName = (splitName + "-" + Date.now() + "." + ext)
      .split(" ")
      .join("_");
    var filePath = "uploads/images/" + folderName + "/" + uniqueName;

    img.mv(filePath, (err) => {
      if (err) {
        console.log("err", err);
        return false;
      }
    });
    return filePath;
  }
};
const checkExistEmailOrContact = async (email, contact, Modals) => {
  let promises = [];
  let Resolve;
  const searchArr = [];

  if (email) {
    searchArr.push({ email });
  }

  if (contact) {
    searchArr.push({ contact });
  }
  if (searchArr.length) {
    try {
      Modals.forEach((data) =>
        promises.push(
          data
            .findOne({ $or: searchArr })
            .select({ email: 1, contact: 1 })
            .lean()
        )
      );

      Resolve = await Promise.all(promises);
    } catch (err) {
      return { status: true, message: "Something went wrong" };
    }

    let existingUser = Resolve.filter((data) => data != null);
    if (existingUser.length != 0) {
      if (existingUser[0].email == email) {
        return {
          status: true,
          message: "Email id already exists.",
        };
      } else if (existingUser[0].contact == contact) {
        return {
          status: true,
          message: "Contact already exists.",
        };
      }
    } else {
      return { status: false };
    }
  }

  return { status: false };
};

const reduxSettingData = [
  "Reading.records_per_page",
  "Reading.date_format",
  "Reading.date_time_format",
  "Site.title",
];

const HttpErrorResponse = (message, errors, otherData = {}) => {
  return {
    status: false,
    data: {},
    message,
    errors,
    ...otherData,
  };
};

const translate = (lang, message) => {
  if (lang === "ar") {
    return arLang[message] ?? message;
  } else if (lang === "tr") {
    return trLang[message] ?? message;
  } else {
    return enLang[message] ?? message;
  }
};

const translateHelper = (req, message) => {
  let language = "en";

  if (req) {
    language = req.get("Accept-Language") ?? "en";
  }

  const translatedMessage = translate(language, message);

  if (message == translatedMessage) {
    // console.log(message);
  }
  return translatedMessage;
};

const ErrorMessageHandler = (Err = [], language) => {
  const Errors = {};
  let message = "";
  Err.forEach((el, index) => {
    if (!Errors[el.param]) {
      Errors[el.param] = [translate(language, el.msg)];
      message += `${translate(language, el.msg)} ${
        Err.length - 1 !== index ? ", " : ""
      }`;
    }
  });
  return { Errors, message };
};

const defaultProfileImage = "uploads/images/profile-pictures/no.jpeg";

const languages = [
  {
    name: "English",
    code: "en",
    default: false,
    image: "uploads/images/language_images/english.svg",
    required: true,
  },
  {
    name: "Arabic",
    code: "ar",
    default: true,
    image: "uploads/images/language_images/english.svg",
    required: true,
  },
  {
    name: "Turkish",
    code: "tr",
    default: false,
    image: "uploads/images/language_images/english.svg",
    required: true,
  },
  // { name: "French", code: "fr", default: false },
];

const newTokenHandler = (res, id) => {
  const token = generateToken(id, true);

  res.set("Access-Control-Expose-Headers", "Access-Token");
  res.set("Access-Token", token);
};

const findKeyPath = (obj, string, key) => {
  const isObject = typeof obj === "object" && !Array.isArray(obj);

  if (!isObject) {
    return null;
  }

  const keys = Object.keys(obj);

  if (keys.includes(key)) {
    string += `${key}`;
    return { data: obj[key], string };
  }

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];

    string += `${k},`;
    const data = findKeyPath(obj[k], string, key);

    if (Array.isArray(data?.data)) {
      return data;
    } else if (data?.data && typeof data.data === "object") {
      return { ...data, data: [data.data] };
    }
  }

  return null;
};

function arrayMoveMutable(array, fromIndex, toIndex) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

const parseIp = (req) =>
  (typeof req.headers["x-forwarded-for"] === "string" &&
    req.headers["x-forwarded-for"].split(",").shift()) ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;

const currencyExchangeRateHandler = async () => {
  let currencies;

  try {
    currencies = await Currency.aggregate([
      {
        $match: {
          exchangeType: "Automatic",
          isDeleted: false,
          code: {
            $ne: "USD",
          },
        },
      },
    ]);
  } catch (err) {
    console.log("currencyExchangeRateHandler err 1", err);
    return;
  }

  if (currencies.length > 0) {
    let data;

    try {
      const response = await axios.get(
        "https://v6.exchangerate-api.com/v6/a8f29586dab97953a4df8386/latest/USD"
      );

      data = response.data;
    } catch (err) {
      console.log("currencyExchangeRateHandler err 2", err);
      return;
    }

    if (data.result !== "success") {
      console.log("currencyExchangeRateHandler err 3");
      return;
    }

    const rates = data.conversion_rates;

    const promises = [];

    currencies.forEach((currency) => {
      const rate = rates[currency.code];

      if (rate) {
        promises.push(
          Currency.findByIdAndUpdate(currency._id, {
            $set: {
              exchangeRate: +rate.toFixed(2),
            },
          })
        );
      }
    });

    try {
      await Promise.all(promises);
    } catch (err) {
      console.log("currencyExchangeRateHandler err 4");
    }
  }
};

// const getAllCategoriesOLD = async () => {
//   let categories;
//   try {
//     categories = await ProductCategory.aggregate(LOOKUP_CATEGORY);
//   } catch (err) {
//     return [];
//   }

//   const categoriesArr = [];

//   const categoryHelper = (categories, namesString) => {
//     for (let i = 0; i < categories.length; i++) {
//       const category = categories[i];
//       let label;
//       if (namesString) {
//         label = `${namesString} ${category.name}`;
//       } else {
//         label = category.name;
//       }
//       categoriesArr.push({ value: category._id, label });
//       if (category.levels) {
//         categoryHelper(category.levels, label + " >");
//       }
//     }
//   };

//   categoryHelper(categories, "");

//   return categoriesArr;
// };

const getAllCategories = async () => {
  // let categories;

  // try {
  //   categories = await ProductCategory.aggregate([
  //     {
  //       $match: {
  //         isActive: true,
  //         isDeleted: false,
  //         parentId: {
  //           $exists: false,
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         name: 1,
  //         levels: [],
  //       },
  //     },
  //   ]);
  // } catch (err) {
  //   return [];
  // }

  // const getCategoriesHandler = async (category) => {
  //   const categories = await ProductCategory.aggregate([
  //     {
  //       $match: {
  //         isDeleted: false,
  //         isActive: true,
  //         parentId: ObjectId(category._id),
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         name: 1,
  //         levels: [],
  //       },
  //     },
  //   ]);

  //   for (let i = 0; i < categories.length; i++) {
  //     category.levels.push(categories[i]);
  //     await getCategoriesHandler(categories[i]);
  //   }
  // };

  // for (let i = 0; i < categories.length; i++) {
  //   await getCategoriesHandler(categories[i]);
  // }

  let categories;

  try {
    categories = await ProductCategory.aggregate([
      {
        $match: {
          parentId: {
            $exists: false,
          },
          isDeleted: false,
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
      {
        $graphLookup: {
          from: "productcategories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "subCategories",
          depthField: "level",
          restrictSearchWithMatch: {
            isDeleted: false,
          },
        },
      },
      {
        $unwind: {
          path: "$subCategories",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "subCategories.level": -1,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          order: 1,
          subCategories: {
            _id: 1,
            name: 1,
            order: 1,
            level: 1,
            parentId: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
          order: {
            $first: "$order",
          },
          subCategories: {
            $push: "$subCategories",
          },
        },
      },
      {
        $addFields: {
          subCategories: {
            $reduce: {
              input: "$subCategories",
              initialValue: {
                level: -1,
                presentChild: [],
                prevChild: [],
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"],
                        },
                        "$$value.prevChild",
                        "$$value.presentChild",
                      ],
                    },
                    current: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"],
                        },
                        "$$value.presentChild",
                        [],
                      ],
                    },
                  },
                  in: {
                    level: "$$this.level",
                    prevChild: "$$prev",
                    presentChild: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              {
                                subCategories: {
                                  $filter: {
                                    input: "$$prev",
                                    as: "e",
                                    cond: {
                                      $eq: ["$$e.parentId", "$$this._id"],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          subCategories: "$subCategories.presentChild",
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
  } catch (err) {
    return [];
  }

  const categoriesArr = [];

  const categoryHelper = (categories, namesString) => {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      let label;
      if (namesString) {
        label = `${namesString} ${category.name}`;
      } else {
        label = category.name;
      }
      categoriesArr.push({ value: category._id, label });
      // if (category.levels) {
      //   categoryHelper(category.levels, label + " >");
      // }
      if (category.subCategories.length > 0) {
        categoryHelper(category.subCategories, label + " >");
      }
    }
  };

  categoryHelper(categories, "");

  return categoriesArr;
};

const importFileDeleteHandler = async () => {
  const directoryPath = path.resolve(
    __dirname,
    "..",
    "uploads",
    "images",
    "product-files"
  );

  let allFiles;

  try {
    allFiles = await promiseFS.readdir(directoryPath);
  } catch (e) {
    console.log("e", e);
    return;
  }

  for (let i = 0; i < allFiles.length; i++) {
    let newPath = directoryPath + "/" + allFiles[i];

    const stats = fs.statSync(newPath);
    const mtime = stats.mtime;

    if (moment(mtime).isSameOrBefore(moment().subtract(24, "hours"))) {
      fs.unlink(newPath, (err) => {
        if (!err) {
          // console.log(allFiles[i] + " deleted");
        }
      });
    }
  }
};

const mediaDownloadHandler = async (media) => {
  const fileName =
    new Date().toISOString().replace(/:/g, "-") + "-" + path.basename(media);

  const localFilePath = path.resolve(
    __dirname,
    "..",
    "uploads",
    "images",
    "product",
    fileName
  );

  const options = {
    url: media,
    dest: localFilePath,
  };

  try {
    downloadResult = await imageDownloader.image(options);
  } catch (e) {
    console.log(e);
  }

  return fileName;
};

const syncProductLinks = async () => {
  let syncList;
  try {
    syncList = await ProductSync.find({
      isAdmin: true,
      isActive: true,
      isDeleted: false,
    }).lean();
  } catch (err) {
    console.log("syncProductLinks 1", err);
    return;
  }

  for (let sl = 0; sl < syncList.length; sl++) {
    const syncObj = syncList[sl];
    const newSyncedAt = moment(syncObj.lastSyncedAt).add(
      syncList.hours,
      "hours"
    );

    // const beforeTime = moment().subtract(10, "minutes");
    // const afterTime = moment().add(10, "minutes");

    // const isTime = moment(newSyncedAt).isBetween(
    //   beforeTime,
    //   afterTime,
    //   undefined,
    //   "[]"
    // );

    const isTime = moment().isAfter(moment(newSyncedAt));

    if (!isTime) {
      continue;
    }

    const { link, containers, mappedObj, fieldsToSync } = syncObj;

    const fileName = `${
      new Date().toISOString().replace(/:/g, "-") + "-"
    }-file.xml`;

    const directoryPath = path.resolve(
      __dirname,
      "..",
      "uploads",
      "images",
      "product-files",
      fileName
    );

    let localFile = fs.createWriteStream(directoryPath);
    const url = new URL(link);
    let client = http;

    client = url.protocol == "https:" ? https : client;

    client.get(link, function (response) {
      response.on("end", function () {
        fs.readFile(directoryPath, async function (err, data) {
          if (err) {
            console.log("syncProductLinks 2", err);
            return;
          }

          let json;

          try {
            json = parser.toJson(data);
          } catch (err) {
            console.log("syncProductLinks 3", err);
            return;
          }

          json = JSON.parse(json);

          // const resultObj = findKeyPath(json, "", container);
          // const result = resultObj?.data;

          let result = JSON.parse(JSON.stringify(json));

          containers.forEach((c) => {
            result = result?.[c];
          });

          if (!result || !Array.isArray(result)) {
            console.log("syncProductLinks 4");
            return;
          }

          // let productsJSON = result?.map((p) => ({ ...p, errors: "" }));
          let products = result;

          const keys = Object.keys(mappedObj);
          const mapKeys = {};

          products = products.map((product, index) => {
            const objToReturn = {
              id: index,
              errors: "",
            };

            keys.forEach((key) => {
              if (key !== "subCategoryId") {
                let obj = mappedObj[key];

                if (obj.value === "subCategoryId") {
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

          let barcodes = products.map((p) => p.barCode);

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

          products = products.map((p) => {
            if (barCodesAvailable.includes(p.barCode)) {
              p.isAlreadyAdded = true;
              p.addedId = onlyCopyids.find(
                (obj) => obj.barCode == p.barCode
              )._id;
              return p;
            }
            return p;
          });

          const digitsKeys = [
            "height",
            "weight",
            "width",
            "length",
            "buyingPrice",
          ];

          let isError = false;

          for (let i = 0; i < digitsKeys.length; i++) {
            if (!mapKeys[digitsKeys[i]]) {
              continue;
            }

            products.forEach((product) => {
              if (
                !product.isAlreadyAdded ||
                (product.isAlreadyAdded &&
                  fieldsToSync.includes(mapKeys[digitsKeys[i]]))
              ) {
                const value = product[digitsKeys[i]];

                if (!/^[0-9]{0,5}\.[0-9]{0,2}$|^[0-9]{0,5}$/.test(+value)) {
                  isError = true;
                }
              }
            });
          }

          if (isError) {
            console.log("syncProductLinks 5");
            return;
          }

          const existInDbArr = [
            {
              value: "masterCategoryId",
              model: ProductCategory,
            },
            {
              value: "unitId",
              model: Unit,
            },
            {
              value: "brandId",
              model: Brand,
            },
          ];

          // const usedCategories = [];

          for (let i = 0; i < existInDbArr.length; i++) {
            const existInDb = existInDbArr[i];

            if (!mapKeys[existInDb.value]) {
              continue;
            }

            const allData = {};

            products.forEach((product) => {
              if (
                !product.isAlreadyAdded ||
                (product.isAlreadyAdded &&
                  fieldsToSync.includes(mapKeys[existInDb.value]))
              ) {
                const value = product[existInDb.value];

                if (allData[value]) {
                  allData[value] = [...allData[value], product.id];
                } else {
                  allData[value] = [product.id];
                }
              }
            });

            const values = Object.keys(allData);

            for (let j = 0; j < values.length; j++) {
              const isExist = await existInDb.model
                .findOne({ name: values[j], isDeleted: false })
                .select("_id")
                .lean();

              if (isExist) {
                allData[values[j]].forEach((id) => {
                  const idx = products.findIndex((p) => p.id == id);
                  products[idx][existInDb.value] = isExist._id;
                });

                if (existInDb.value === "masterCategoryId") {
                  // usedCategories.push(isExist._id);
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

                        insertedId = newProductCategory._id;

                        // usedCategories.push(newProductCategory._id);
                      }
                      break;
                    case "unitId":
                      {
                        const newUnit = new Unit({
                          name: values[j],
                        });

                        const promises = [await newUnit.save()];

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

                        const promises = [await newBrand.save()];

                        for (let i = 0; i < languages.length; i++) {
                          const code = languages[i].code;

                          let obj = new MasterDescription({
                            languageCode: code,
                            name: `${values[j]} ${code !== "en" ? code : ""}`,
                            mainPage: newBrand._id,
                            key: "brand",
                          });

                          promises.push(obj.save());
                        }

                        await Promise.all(promises);

                        insertedId = newBrand._id;
                      }
                      break;
                    default: {
                    }
                  }
                } catch (err) {
                  console.log("syncProductLinks 6", err);
                  return;
                }

                if (insertedId) {
                  allData[values[j]].forEach((id) => {
                    const idx = products.findIndex((p) => p.id == id);
                    products[idx][existInDb.value] = insertedId;
                  });
                }
              }
            }
          }

          let originalCategoryId = "masterCategoryId";

          if (keys.includes("subCategoryId")) {
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

                  if (product.isAlreadyAdded) {
                    continue;
                  }

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

          for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let id;

            if (product.isAlreadyAdded) {
              // addedId
              const newProductObj = {};
              id = product.addedId;

              fieldsToSync.forEach((field) => {
                if (product[field]) {
                  newProductObj[field] = product[field];
                }
              });

              product = newProductObj;
            }

            if (product.media) {
              if (!Array.isArray(product.media.img_item)) {
                let media = product.media.img_item;
                const mediaUrl = await mediaDownloadHandler(media);

                product.media = [
                  {
                    src: `uploads/images/product/${mediaUrl}`,
                    isImage: true,
                  },
                ];

                product.coverImage = `uploads/images/product/${mediaUrl}`;
              } else {
                let medias = product.media.img_item;
                const mediaUrls = [];
                for (let j = 0; j < medias.length; j++) {
                  const media = await mediaDownloadHandler(medias[j]);
                  mediaUrls.push(media);
                }

                product.media = mediaUrls.map((mediaUrl, idx) => ({
                  src: `uploads/images/product/${mediaUrl}`,
                  isImage: true,
                }));

                product.coverImage = product.media[0]?.src;
              }
            }

            if (id) {
              await Product.findByIdAndUpdate(id, {
                $set: product,
              });

              const keysThatNeedUpdate = [
                "name",
                "shortDescription",
                "longDescription",
              ];

              const metaKeysThatNeedUpdate = [
                "metaDataTitle",
                "metaDataTitle",
                "metaDataAuthor",
                "metaDataKeywords",
              ];

              const langObj = {};

              for (let j = 0; j < keysThatNeedUpdate.length; j++) {
                const key = keysThatNeedUpdate[j];
                if (product[key]) {
                  langObj[key] = product[key];
                }
              }

              for (let j = 0; j < metaKeysThatNeedUpdate.length; j++) {
                const key = metaKeysThatNeedUpdate[j];
                if (product[key]) {
                  langObj[`metaData.${key}`] = product[key];
                }
              }

              if (Object.keys(langObj).length > 0) {
                await ProductDescription.findOneAndUpdate(
                  {
                    productId: id,
                    languageCode: "en",
                  },
                  {
                    $set: langObj,
                  }
                );
              }
            } else {
              const newProduct = new Product({
                featureTitle: "Features",
                height: 0,
                weight: 0,
                width: 0,
                length: 0,
                ...product,
                categoryId: product[originalCategoryId],
                isPublished: false,
                isApproved: true,
              });

              await newProduct.save();

              const langPromise = [];

              const valueHandler = (code, key) => {
                return code == "en" ? product[key] ?? " " : " ";
              };

              for (let i = 0; i < languages.length; i++) {
                let code = languages[i].code;

                obj = new ProductDescription({
                  productId: newProduct._id,
                  languageCode: code,
                  name: product.name,
                  shortDescription: valueHandler(code, "shortDescription"),
                  longDescription: valueHandler(code, "longDescription"),
                  metaData: {
                    title: valueHandler(code, "metaDataTitle"),
                    description: valueHandler(code, "metaDataDescription"),
                    author: valueHandler(code, "metaDataAuthor"),
                    keywords: valueHandler(code, "metaDataKeywords"),
                  },
                });

                langPromise.push(obj.save());
              }

              await Promise.all(langPromise);
            }
          }

          const oldProductsCount = barCodesAvailable.length;
          const newProductsCount = products.length - barCodesAvailable.length;

          const newProductSyncHistory = new ProductSyncHistory({
            productSyncId: syncObj._id,
            oldProductsCount,
            newProductsCount,
            syncedAt: new Date(),
          });

          Promise.all([
            newProductSyncHistory.save(),
            ProductSync.findByIdAndUpdate(syncObj._id, {
              $set: {
                lastSyncedAt: new Date(),
              },
            }),
          ]);
        });
      });

      response.pipe(localFile);
    });
  }
};

const currentAndUSDCurrencyData = async (countryId) => {
  let currentCurrency, usdCurrency;

  try {
    currentCurrency = Country.aggregate([
      {
        $match: {
          $or: [{ _id: new ObjectId(countryId) }, { name: "Saudi Arabia" }],
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currencyData",
        },
      },
      {
        $unwind: {
          path: "$currencyData",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$currencyData",
        },
      },
    ]);

    usdCurrency = Currency.aggregate([
      {
        $match: {
          sign: "$",
        },
      },
      {
        $limit: 1,
      },
    ]);

    [[currentCurrency], [usdCurrency]] = await Promise.all([
      currentCurrency,
      usdCurrency,
    ]);
  } catch (err) {
    return {
      status: false,
    };
  }

  return {
    status: true,
    currentCurrency,
    usdCurrency,
  };
};

const countryNameFromLatLng = async (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) {
    return null;
  }

  let res;

  try {
    res = await geocoder.reverse({
      lat: coordinates[1],
      lon: coordinates[0],
    });
  } catch (err) {
    return null;
  }

  if (res.length == 0) {
    return null;
  }

  return res[0].country || null;
};

const isParentCategoriesActive = async (parentId) => {
  // const getParentCategory = async (parentId) => {
  //   let category;

  //   try {
  //     category = await ProductCategory.findOne({
  //       _id: ObjectId(parentId),
  //       isActive: true,
  //       isDeleted: false,
  //     }).lean();
  //   } catch (err) {
  //     return false;
  //   }

  //   if (!category) {
  //     return false;
  //   }

  //   if (category.parentId) {
  //     let status = await getParentCategory(category.parentId);
  //     return status;
  //   }

  //   return true;
  // };

  // const status = await getParentCategory(parentId);

  // return status;

  let categories;

  try {
    [categories] = await ProductCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          _id: new ObjectId(parentId),
        },
      },
      {
        $graphLookup: {
          from: "productcategories",
          startWith: "$parentId",
          connectFromField: "parentId",
          connectToField: "_id",
          as: "subCategories",
          depthField: "level",
          restrictSearchWithMatch: {
            isDeleted: false,
          },
        },
      },
      {
        $project: {
          _id: 1,
          isActive: 1,
          subCategories: {
            _id: 1,
            isActive: 1,
          },
        },
      },
    ]);
  } catch (err) {
    return false;
  }

  if (!categories) {
    return false;
  }

  for (let i = 0; i < categories.subCategories.length; i++) {
    if (!categories.subCategories[i].isActive) {
      return false;
    }
  }

  return true;
};

const getChildCategories = async (id) => {
  /*
    const getCategoriesHandler = async (id, ids) => {
      const categories = await ProductCategory.aggregate([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            parentId: ObjectId(id),
          },
        },
      ]);

      for (let i = 0; i < categories.length; i++) {
        ids.push(categories[i]._id);
        await getCategoriesHandler(categories[i]._id, ids);
      }
    };

    const categories = await ProductCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          parentId: ObjectId(id),
        },
      },
    ]);

    const ids = [];

    for (let i = 0; i < categories.length; i++) {
      ids.push(categories[i]._id);
      await getCategoriesHandler(categories[i]._id, ids);
    }

    return ids;
  */
  /*
    const getCategoriesHandler = (initialCategories, ids) => {
      for (let i = 0; i < initialCategories.length; i++) {
        ids.push(initialCategories[i]._id);
        getCategoriesHandler(initialCategories[i].subCategories, ids);
      }
    };

    const categories = await ProductCategory.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          parentId: new ObjectId(id),
        },
      },
      {
        $graphLookup: {
          from: "productcategories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "subCategories",
          depthField: "level",
          restrictSearchWithMatch: {
            isDeleted: false,
            isActive: true,
          },
        },
      },
      {
        $unwind: {
          path: "$subCategories",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "subCategories.level": -1,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          order: 1,
          subCategories: {
            _id: 1,
            name: 1,
            order: 1,
            level: 1,
            parentId: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: {
            $first: "$name",
          },
          order: {
            $first: "$order",
          },
          subCategories: {
            $push: "$subCategories",
          },
        },
      },
      {
        $addFields: {
          subCategories: {
            $reduce: {
              input: "$subCategories",
              initialValue: {
                level: -1,
                presentChild: [],
                prevChild: [],
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"],
                        },
                        "$$value.prevChild",
                        "$$value.presentChild",
                      ],
                    },
                    current: {
                      $cond: [
                        {
                          $eq: ["$$value.level", "$$this.level"],
                        },
                        "$$value.presentChild",
                        [],
                      ],
                    },
                  },
                  in: {
                    level: "$$this.level",
                    prevChild: "$$prev",
                    presentChild: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              {
                                subCategories: {
                                  $filter: {
                                    input: "$$prev",
                                    as: "e",
                                    cond: {
                                      $eq: ["$$e.parentId", "$$this._id"],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          subCategories: "$subCategories.presentChild",
        },
      },
    ]);

    const ids = [];

    for (let i = 0; i < categories.length; i++) {
      ids.push(categories[i]._id);
      getCategoriesHandler(categories[i].subCategories, ids);
    }

    return ids;
  */

  const categories = await ProductCategory.aggregate([
    {
      $match: {
        isDeleted: false,
        isActive: true,
        parentId: new ObjectId(id),
      },
    },
    {
      $graphLookup: {
        from: "productcategories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        as: "subCategories",
        depthField: "level",
        restrictSearchWithMatch: {
          isDeleted: false,
          isActive: true,
        },
      },
    },
    {
      $project: {
        _id: 1,
        subCategories: {
          _id: 1,
        },
      },
    },
    {
      $unwind: {
        path: "$subCategories",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  const ids = new Set([]);

  for (let i = 0; i < categories.length; i++) {
    ids.add(categories[i]._id);
    categories[i].subCategories && ids.add(categories[i].subCategories._id);
  }

  return [...ids];
};

const getCurrencyDataByCode = async (code) => {
  let currency;

  try {
    [currency] = await Currency.aggregate([
      {
        $match: {
          code,
          isDeleted: false,
        },
      },
    ]);
  } catch (err) {
    return {
      status: false,
      message: "Something went wrong",
    };
  }

  if (!currency) {
    return {
      status: false,
      message: "No currency found",
    };
  }

  return {
    status: true,
    currency,
  };
};

const getCountryByName = async (name) => {
  let country;

  try {
    [country] = await Country.aggregate([
      {
        $match: {
          name,
          isDeleted: false,
        },
      },
    ]);
  } catch (err) {
    return {
      status: false,
      message: "Something went wrong",
    };
  }

  if (!country) {
    return {
      status: false,
      message: "No country found",
    };
  }

  return {
    status: true,
    country,
  };
};

const sendNotification = async ({
  templateName,
  data,
  actions,
  notificationTemplateName,
  notificationTemplateData, //ctaType, actionFor, actionId, purpose, extras
  mailData = {},
}) => {
  let user;

  try {
    if (data.role === "customer") {
      user = await Customer.findById(data.userId).lean();
      if (!data["USER_NAME"] && actions.find((a) => a == "USER_NAME")) {
        data["USER_NAME"] = `${user.firstName} ${user.lastName}`;
      }

      if (!data.to) {
        data.to = user.email;
      }
    } else if (data.role === "vendor") {
      user = await Vendor.findById(data.userId).lean();
      if (!data["USER_NAME"] && actions.find((a) => a == "USER_NAME")) {
        data["USER_NAME"] = user.businessName;
      }
      if (!data.to) {
        data.to = user.businessEmail;
      }
    } else if (data.role == "admin") {
    } else {
    }

    // if (!user[data.setting_name]) {
    //   return;
    // }

    let emailTemplate = await EmailTemplate.findOne({ name: templateName });

    if (false && emailTemplate) {
      let message = emailTemplate.body;

      for (let i = 0; i < actions.length; i++) {
        message = message.replace(`{${actions[i]}}`, data[actions[i]]);
      }

      const subject = emailTemplate.subject;

      await emailSendInLoop(null, data.to, subject, message, mailData);
    }

    if (notificationTemplateName) {
      let template = await NotificationTemplate.findOne({
        name: notificationTemplateName,
      });

      if (template) {
        const subject = template.subject;

        let message = template.body;

        for (let i = 0; i < actions.length; i++) {
          message = message.replace(`{${actions[i]}}`, data[actions[i]]);
        }

        await sendTextNotification({
          userId: data.userId,
          text: message,
          subject,
          ...notificationTemplateData,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const sendTextNotification = async (data) => {
  const newNotification = new Notification(data);

  const { userId, subject, text, actionId } = data;

  let [devices] = await Promise.all([
    DeviceId.find({ userId: ObjectId(userId) }).lean(),
    newNotification.save(),
  ]);

  //socket id

  //in app notification

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];

    pushNotificationHelper({
      to: device.deviceId,
      device: device.type,
      collapse_key: data.actionFor,
      notification: { title: subject, body: text },
      data: {
        id: actionId,
      },
      _id: device._id,
    });
  }
};

const allStatusObj = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  return_requested: "Return Requested",
  return_accepted: "Return Accepted",
  return_rejected: "Return Rejected",
  out_for_pickup: "Out For Pickup",
  return_completed: "Return Completed",
  cancelled: "Cancelled",
};

const orderStatuses = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  null,
  "return_requested",
  "return_accepted",
  "out_for_pickup",
  "return_completed",
];

const activeStatusMap = new Map([
  // ["pending", "Order Pending"],
  // ["failed", "Order Failed"],
  ["placed", "Order Placed"],
  //   ["confirmed", "Order Confirmed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
  // cancelled
]);

const returnStatusMap = new Map([
  ["return_requested", "Return Requested"],
  // ["return_accepted", "Return Accepted"],
  ["out_for_pickup", "Out For Pickup"],
  ["return_completed", "Return Completed"],
]);

const orderStatusNotificationHandler = async (
  itemId,
  type,
  customerId,
  vendorId,
  reason
) => {
  let emailContent = OrderItem.aggregate([
    {
      $match: {
        _id: new ObjectId(itemId),
      },
    },
    {
      $lookup: {
        from: "orders",
        let: {
          id: "$orderId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$_id"],
              },
            },
          },
        ],
        as: "orderData",
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
          quantity: "$quantity",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["main", "$$itemSubType"],
                  },
                },
              ],
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
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "productdescriptions",
              let: {
                id: "$productId",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$productId", "$$id"],
                        },
                        languageCode: "en",
                      },
                    ],
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    slug: 1,
                    shortDescription: 1,
                  },
                },
              ],
              as: "langData",
            },
          },
          {
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
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
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$langData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "main",
              vendorId: 1,
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendorName: "$vendorData.businessName",
              categoryId: "$productData.categoryId",
              shortDescription: "$langData.shortDescription",
            },
          },
        ],
        as: "vendorProduct",
      },
    },
    {
      $lookup: {
        from: "vendorproductvariants",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["variant", "$$itemSubType"],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$mainProductId",
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
                    coverImage: 1,
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
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
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $lookup: {
              from: "productvariants",
              let: {
                id: "$mainProductId",
                productVariantId: "$productVariantId",
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
                          $eq: ["$_id", "$$productVariantId"],
                        },
                      },
                    ],
                  },
                },
                {
                  $lookup: {
                    from: "productvariantdescriptions",
                    let: {
                      productVariantId: "$_id",
                    },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $eq: [
                                  "$productVariantId",
                                  "$$productVariantId",
                                ],
                              },
                              languageCode: "en",
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          name: 1,
                          slug: 1,
                          shortDescription: 1,
                        },
                      },
                    ],
                    as: "langData",
                  },
                },
                {
                  $unwind: {
                    path: "$langData",
                  },
                },
              ],
              as: "variantData",
            },
          },
          {
            $unwind: {
              path: "$variantData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "variant",
              vendorId: 1,
              media: "$productData.coverImage",
              name: "$langData.name",
              slug: "$langData.slug",
              vendorName: "$vendorData.businessName",
              firstVariantName: "$variantData.firstVariantName",
              secondVariantName: "$variantData.secondVariantName",
              firstSubVariantName: "$variantData.firstSubVariantName",
              secondSubVariantName: "$variantData.secondSubVariantName",
              slug: "$variantData.langData.slug",
              name: "$variantData.langData.name",
              categoryId: "$productData.categoryId",
              shortDescription: "$langData.shortDescription",
            },
          },
        ],
        as: "vendorProductVariant",
      },
    },
    {
      $addFields: {
        product: {
          $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
        },
      },
    },
    {
      $addFields: {
        product: {
          $arrayElemAt: ["$product", 0],
        },
        orderData: {
          $arrayElemAt: ["$orderData", 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        ORDER_NUMBER: "$orderData.customId",
        ORDER_DATE: "$orderData.createdAt",
        CUSTOMER_NAME: "$orderData.address.name",
        CUSTOMER_PHONE_NUMBER: "$orderData.address.contact",
        CUSTOMER_HOUSE_NO: "$orderData.address.houseNo",
        CUSTOMER_ADDRESS: "$orderData.address.street",
        CUSTOMER_LANDMARK: "$orderData.address.landmark",
        CUSTOMER_ADDRESS_POSTAL_CODE: "$orderData.address.pinCode",
        PRODUCT_NAME: "$product.name",
        PRODUCT_QUANTITY: "$product.quantity",
        VENDOR_NAME: "$product.vendorName",
      },
    },
  ]);

  let adminSetting = Setting.findOne({ key: "Site.orderEmail" }).lean();

  [[emailContent], adminSetting] = await Promise.all([
    emailContent,
    adminSetting,
  ]);

  const emailSendData = [];

  switch (type) {
    case "packed": {
      emailSendData.push({
        template: "Order Packed (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Packed (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "shipped": {
      emailSendData.push({
        template: "Order Shipped (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Shipped (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "out_for_delivery": {
      emailSendData.push({
        template: "Order Out For Delivery (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Out For Delivery (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "delivered": {
      emailSendData.push({
        template: "Order Delivered (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Delivered (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "return_requested": {
      emailSendData.push({
        template: "Order Return Requested (Email to Vendor)",
        role: "vendor",
        toUserId: vendorId,
        extraActions: ["REASON"],
        notificationTemplateName: "Order Return Requested (Vendor)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "return_accepted": {
      emailSendData.push({
        template: "Order Return Accepted (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Return Accepted (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "return_rejected": {
      emailSendData.push({
        template: "Order Return Rejected (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: ["REASON"],
        notificationTemplateName: "Order Return Rejected (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "out_for_pickup": {
      emailSendData.push({
        template: "Order Return Out For Pickup (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Return Out For Pickup (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "return_completed": {
      emailSendData.push({
        template: "Order Return Completed (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: [],
        notificationTemplateName: "Order Return Completed (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      emailSendData.push({
        template: "Order Return Completed (Email to Vendor)",
        role: "vendor",
        toUserId: vendorId,
        extraActions: [],
        notificationTemplateName: "Order Return Completed (Vendor)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      break;
    }
    case "cancelled": {
      emailSendData.push({
        template: "Order Cancelled (Email to Customer)",
        role: "customer",
        toUserId: customerId,
        extraActions: ["REASON"],
        notificationTemplateName: "Order Cancelled (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      emailSendData.push({
        template: "Order Cancelled (Email to Vendor)",
        role: "vendor",
        toUserId: vendorId,
        extraActions: ["REASON"],
        notificationTemplateName: "Order Cancelled (Vendor)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: itemId,
          purpose: "other",
          extras: {},
        },
      });
      emailSendData.push({
        template: "Order Cancelled (Email to Admin)",
        role: "admin",
        to: adminSetting.value,
        extraActions: ["REASON"],
      });
    }
  }

  for (let i = 0; i < emailSendData.length; i++) {
    const emailSendObj = emailSendData[i];

    await sendNotification({
      templateName: emailSendObj.template,
      data: {
        role: emailSendObj.role,
        REASON: reason,
        userId: emailSendObj.toUserId,
        to: emailSendObj.to,
        ...emailContent,
      },
      actions: [
        "USER_NAME",
        "ORDER_NUMBER",
        "ORDER_DATE",
        "CUSTOMER_NAME",
        "CUSTOMER_PHONE_NUMBER",
        "CUSTOMER_HOUSE_NO",
        "CUSTOMER_ADDRESS",
        "CUSTOMER_LANDMARK",
        "CUSTOMER_ADDRESS_POSTAL_CODE",
        "PRODUCT_NAME",
        "PRODUCT_QUANTITY",
        "VENDOR_NAME",
        ...emailSendObj.extraActions,
      ],
      notificationTemplateName: emailSendObj.notificationTemplateName,
      notificationTemplateData: emailSendObj.notificationTemplateData,
    });
  }
};

const successPaymentHelper = async (transaction) => {
  await Cart.deleteMany({ customerId: ObjectId(transaction.customerId) });

  if (true) {
    let orderItemsData = Transaction.aggregate([
      {
        $match: {
          _id: new ObjectId(transaction._id),
        },
      },
      {
        $lookup: {
          from: "orderitems",
          let: {
            orderId: "$orderId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$orderId", "$$orderId"],
                },
              },
            },
          ],
          as: "orderItemsData",
        },
      },
      {
        $unwind: {
          path: "$orderItemsData",
        },
      },
      {
        $lookup: {
          from: "vendorproducts",
          let: {
            id: "$orderItemsData.itemId",
            itemSubType: "$orderItemsData.itemSubType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                $and: [
                  {
                    $expr: {
                      $eq: ["main", "$$itemSubType"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productdescriptions",
                let: {
                  id: "$productId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$productId", "$$id"],
                          },
                          languageCode: "en",
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 1,
                    },
                  },
                ],
                as: "langData",
              },
            },
            {
              $unwind: {
                path: "$langData",
              },
            },
            {
              $project: {
                _id: 0,
                name: "$langData.name",
              },
            },
          ],
          as: "vendorProduct",
        },
      },
      {
        $lookup: {
          from: "vendorproductvariants",
          let: {
            id: "$orderItemsData.itemId",
            itemSubType: "$orderItemsData.itemSubType",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
                $and: [
                  {
                    $expr: {
                      $eq: ["variant", "$$itemSubType"],
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productvariants",
                let: {
                  id: "$mainProductId",
                  productVariantId: "$productVariantId",
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
                            $eq: ["$_id", "$$productVariantId"],
                          },
                        },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: "productvariantdescriptions",
                      let: {
                        productVariantId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $and: [
                              {
                                $expr: {
                                  $eq: [
                                    "$productVariantId",
                                    "$$productVariantId",
                                  ],
                                },
                                languageCode: "en",
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
                      as: "langData",
                    },
                  },
                  {
                    $unwind: {
                      path: "$langData",
                    },
                  },
                ],
                as: "variantData",
              },
            },
            {
              $unwind: {
                path: "$variantData",
              },
            },
            {
              $project: {
                _id: 0,
                name: "$variantData.langData.name",
              },
            },
          ],
          as: "vendorProductVariant",
        },
      },
      {
        $addFields: {
          product: {
            $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
          },
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$product.name",
          price: "$orderItemsData.price",
          quantity: "$orderItemsData.quantity",
          totalPrice: "$orderItemsData.total",
        },
      },
    ]);

    let customerTransactionData = Transaction.aggregate([
      {
        $match: {
          _id: new ObjectId(transaction._id),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderData",
        },
      },
      {
        $addFields: {
          orderData: {
            $arrayElemAt: ["$orderData", 0],
          },
        },
      },
      {
        $project: {
          _id: 0,
          role: "customer",
          userId: "$customerId",
          ORDER_ID: "$orderData._id",
          ORDER_NUMBER: "$orderData.customId",
          ORDER_DATE: "$orderData.createdAt",
          // ORDER_SUB_TOTAL: "$orderData.subTotal",
          // ORDER_DELIVERY_FEE: "$orderData.deliveryFee",
          // ORDER_TAX: "$orderData.tax",
          // ORDER_CUSTOM_FEE: "$orderData.customFee",
          // ORDER_COUPON_DISCOUNT: "$orderData.couponDiscount",
          // ORDER_TOTAL: "$orderData.total",
          ORDER_SUB_TOTAL: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.subTotal" },
            ],
          },
          ORDER_DELIVERY_FEE: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.deliveryFee" },
            ],
          },
          ORDER_TAX: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.tax" },
            ],
          },
          ORDER_CUSTOM_FEE: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.customFee" },
            ],
          },
          ORDER_COUPON_DISCOUNT: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.couponDiscount" },
            ],
          },
          ORDER_TOTAL: {
            $concat: [
              "$orderData.paymentCurrencyData.sign",
              { $toString: "$orderData.total" },
            ],
          },
          CUSTOMER_NAME: "$orderData.address.name",
          CUSTOMER_PHONE_NUMBER: "$orderData.address.contact",
          CUSTOMER_HOUSE_NO: "$orderData.address.houseNo",
          CUSTOMER_ADDRESS: "$orderData.address.street",
          CUSTOMER_LANDMARK: "$orderData.address.landmark",
          CUSTOMER_ADDRESS_POSTAL_CODE: "$orderData.address.pinCode",
          CUSTOMER_CITY: "$orderData.address.city",
          CUSTOMER_STATE: "$orderData.address.state",
          currency: "$orderData.paymentCurrencyData.sign",
        },
      },
    ]);

    let vendorTransactionData = Transaction.aggregate([
      {
        $match: {
          _id: new ObjectId(transaction._id),
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderId",
          foreignField: "orderId",
          as: "items",
        },
      },
      {
        $unwind: {
          path: "$items",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$items",
        },
      },
      {
        $group: {
          _id: "$vendorId",
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    let customerData = Customer.findById(transaction.customerId).lean();

    let adminSetting = Setting.findOne({ key: "Site.orderEmail" }).lean();

    [
      [customerTransactionData],
      vendorTransactionData,
      customerData,
      adminSetting,
      orderItemsData,
    ] = await Promise.all([
      customerTransactionData,
      vendorTransactionData,
      customerData,
      adminSetting,
      orderItemsData,
    ]);

    const pdfData = {
      orderId: customerTransactionData.ORDER_NUMBER,
      // orderDate: moment(customerTransactionData.ORDER_DATE).format(
      //   "DD-MM-YYYY hh:mm A"
      // ),
      orderDate: moment(customerTransactionData.ORDER_DATE).format(
        "DD-MM-YYYY"
      ),
      orderAmount: customerTransactionData.ORDER_TOTAL,
      addressName: customerTransactionData.CUSTOMER_NAME,
      addressHouseNo: customerTransactionData.CUSTOMER_HOUSE_NO,
      addressStreet: customerTransactionData.CUSTOMER_ADDRESS,
      addressCity: customerTransactionData.CUSTOMER_CITY,
      addressState: customerTransactionData.CUSTOMER_STATE,
      // items: [
      //   { name: "First", price: "﷼ 50", quantity: 2, totalPrice: "100 ﷼" },
      //   { name: "Second", price: "﷼ 100", quantity: 4, totalPrice: "400 ﷼" },
      // ],
      items: orderItemsData.map((item) => ({
        ...item,
        price: `${customerTransactionData.currency} ${item.price}`,
        totalPrice: `${customerTransactionData.currency} ${item.totalPrice}`,
      })),
      subTotal: customerTransactionData.ORDER_SUB_TOTAL,
      deliveryFee: customerTransactionData.ORDER_DELIVERY_FEE,
      taxes: customerTransactionData.ORDER_TAX,
      total: customerTransactionData.ORDER_TOTAL,
    };

    const fileResponseForCustomer = await getOrderInvoice(pdfData);

    let mailData = {};

    if (fileResponseForCustomer.status) {
      mailData = {
        attachments: [
          {
            filename: `Invoice-${pdfData.orderId}`,
            path: path.resolve(__dirname, "..", fileResponseForCustomer.name),
            cid: `Invoice-${pdfData.orderId}`,
          },
        ],
      };
    }

    await Promise.all([
      sendNotification({
        templateName: "Order Placed (Email To Customer)",
        data: {
          ...customerTransactionData,
          ORDER_DATE: moment(customerTransactionData.ORDER_DATE).format(
            "DD-MM-YYYY hh:mm A"
          ),
        },
        actions: [
          "USER_NAME",
          "ORDER_NUMBER",
          "ORDER_DATE",
          "ORDER_SUB_TOTAL",
          "ORDER_DELIVERY_FEE",
          "ORDER_TAX",
          "ORDER_CUSTOM_FEE",
          "ORDER_COUPON_DISCOUNT",
          "ORDER_TOTAL",
          "CUSTOMER_NAME",
          "CUSTOMER_PHONE_NUMBER",
          "CUSTOMER_HOUSE_NO",
          "CUSTOMER_ADDRESS",
          "CUSTOMER_LANDMARK",
          "CUSTOMER_ADDRESS_POSTAL_CODE",
        ],
        notificationTemplateName: "Order Placed (Customer)",
        notificationTemplateData: {
          ctaType: "link",
          actionFor: "order",
          actionId: customerTransactionData.ORDER_ID,
          purpose: "other",
          extras: {},
        },
        mailData,
      }),
      ...vendorTransactionData.map((vendor) =>
        sendNotification({
          templateName: "Order Placed (Email To Vendor)",
          data: {
            ...customerTransactionData,
            userId: vendor._id,
            ORDER_DATE: moment(customerTransactionData.ORDER_DATE).format(
              "DD-MM-YYYY hh:mm A"
            ),
            ORDER_TOTAL: `${customerTransactionData.currency} ${vendor.total}`,
            role: "vendor",
          },
          actions: [
            "USER_NAME",
            "ORDER_NUMBER",
            "ORDER_DATE",
            "ORDER_TOTAL",
            "CUSTOMER_NAME",
            "CUSTOMER_PHONE_NUMBER",
            "CUSTOMER_HOUSE_NO",
            "CUSTOMER_ADDRESS",
            "CUSTOMER_LANDMARK",
            "CUSTOMER_ADDRESS_POSTAL_CODE",
          ],
          notificationTemplateName: "Order Placed (Vendor)",
          notificationTemplateData: {
            ctaType: "link",
            actionFor: "order",
            actionId: customerTransactionData.ORDER_ID,
            purpose: "other",
            extras: {},
          },
        })
      ),
      sendNotification({
        templateName: "Order Placed (Email To Admin)",
        data: {
          ...customerTransactionData,
          ORDER_DATE: moment(customerTransactionData.ORDER_DATE).format(
            "DD-MM-YYYY hh:mm A"
          ),
          USER_NAME: `${customerData.firstName} ${customerData.lastName}`,
          USER_EMAIL: customerData.email,
          USER_PHONE_NUMBER: customerData.contact,
          to: adminSetting.value,
          role: "admin",
        },
        actions: [
          "ORDER_NUMBER",
          "ORDER_DATE",
          "ORDER_SUB_TOTAL",
          "ORDER_DELIVERY_FEE",
          "ORDER_TAX",
          "ORDER_CUSTOM_FEE",
          "ORDER_COUPON_DISCOUNT",
          "ORDER_TOTAL",
          "CUSTOMER_NAME",
          "CUSTOMER_PHONE_NUMBER",
          "CUSTOMER_HOUSE_NO",
          "CUSTOMER_ADDRESS",
          "CUSTOMER_LANDMARK",
          "CUSTOMER_ADDRESS_POSTAL_CODE",
          "USER_NAME",
          "USER_EMAIL",
          "USER_PHONE_NUMBER",
        ],
      }),
    ]);
  }
};

const pendingPaymentHelper = async () => {
  const date = moment().subtract({ minutes: 20 });

  let transactions;

  try {
    transactions = await Transaction.aggregate([
      {
        $match: {
          status: "pending",
          createdAt: {
            $lte: new Date(date),
          },
        },
      },
    ]);
  } catch (err) {
    console.log("pendingPaymentHelper err 1", err);
    return;
  }

  let pendingTransactionChecked = 0;

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];

    const ref = transaction.telrRef;

    let data = JSON.stringify({
      method: "check",
      store: process.env.TELR_STORE_ID,
      authkey: process.env.TELR_AUTH_KEY,
      order: {
        ref,
      },
    });

    let telrResponse;

    try {
      telrResponse = await axios({
        method: "post",
        maxBodyLength: Infinity,
        url: "https://secure.telr.com/gateway/order.json",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        data: data,
      });
      telrResponse = telrResponse.data;
    } catch (err) {
      console.log("pendingPaymentHelper err 2", err);
      continue;
    }

    const statusCode = telrResponse.order.status.code;

    if (statusCode == 1) {
      continue;
    }

    pendingTransactionChecked++;

    await Promise.all([
      Transaction.findByIdAndUpdate(transaction._id, {
        $set: {
          status: statusCode == 3 ? "success" : "failed",
          telrOrderDetails: telrResponse.order,
        },
      }),
      OrderItemStatus.updateMany(
        {
          orderId: ObjectId(transaction.orderId),
        },
        {
          $set: {
            status: statusCode == 3 ? "placed" : "failed",
          },
        }
      ),
    ]);

    if (statusCode == 3) {
      await successPaymentHelper(transaction);
    }
  }

  // console.log(`Checked ${pendingTransactionChecked} pending transactions`);
};

const getOrderItems = (items) => {
  let data = "";

  for (let item of items) {
    data += ` <tr>
    <td style=" font-size: 14px; padding: 10px 15px; border-bottom: 1px solid #e0e0e0;text-align: left;">
      ${item.name}
    </td>
    <td style="font-size: 14px; padding: 10px 15px; border-bottom: 1px solid #e0e0e0;text-align: left;">
      ${item.price}
    </td>
    <td style="font-size: 14px; padding: 10px 15px; border-bottom: 1px solid #e0e0e0;text-align: left;">
      ${item.quantity}
    </td>
    <td style="font-size: 14px; padding: 10px 15px; border-bottom: 1px solid #e0e0e0;text-align: center;">
      ${item.totalPrice}
    </td>
  </tr>`;
  }

  return data;
};

const getOrderHTML = (data) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Order Invoice</title>
  
    <style type="text/css">
      * {
        font-family: 'Calibri';
      }
    </style>
  </head>
  
  <body offset="0" class="body"
    style="padding:0; margin:20px 0; display:block; -webkit-text-size-adjust:none;  margin: 20px auto;">
    <table align="center" cellpadding="0" cellspacing="0" height="100%" width="100%" style="background-color:#ffffff;">
      <tbody>
        <tr>
          <td align="left" valign="middle" style=" text-align: left; font-weight: bold; padding: 40px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="text-align: left; font-weight:bold;">
                          <a href="#!"> <img src="https://noonmarssr.stage04.obdemo.com/assets/img/logo.png" width="200"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td align="right" valign="top">
            <table width="350" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; padding: 40px;">
                      <tr>
                        <td style="font-weight:bold; font-size: 24px; color:#000000; padding-bottom: 20px;" colspan="2">
                          INVOICE
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          Order ID:</td>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          <strong>#${data.orderId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          Order Date:</td>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          <strong>${data.orderDate}<strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          Total Amount:</td>
                        <td style="font-size: 15px; color: #666666; font-weight: 500; line-height: 22px;">
                          <strong>${data.orderAmount}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
  
  
        <tr>
          <td style="width:100%; padding: 40px;" colspan="2">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td style="width:50%;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td>
                            <h5 style="margin: 0; font-weight: 500; font-size: 16px; color: #333333;line-height: 23px;">
  
                              <strong
                                style="padding:0 0 5px; margin: 0; font-size: 16px;color: #000000;display: block;font-weight: 700;">FROM
                                :</strong>
                              Noonmar
                              <br />
                              
                              <br />
                              
                              <br />
                              <br />
                              
                              
                            </h5>
  
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
  
                  <td style="width:50%;" valign="top">
                    <table cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td>
                            <table width="100%" cellspacing="0" cellpadding="0">
                              <tbody>
                                <tr>
                                  <td>
                                    <h5
                                      style="margin: 0; font-weight: 500; font-size: 16px; color: #333333;line-height: 23px;">
  
                                      <strong
                                        style="padding:0 0 5px; margin: 0; font-size: 16px;color: #000000;display: block;font-weight: 700;">TO
                                        :</strong>
                                      ${data.addressName}
                                      <br />
                                     ${data.addressHouseNo}, ${
    data.addressStreet
  }
                                      <br />
                                      ${data.addressCity}, ${data.addressState}
                                    </h5>
                                  </td>
  
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
  
        </tr>
  
        <!--  -->
        <tr>
          <td style="width:100%;" colspan="2">
            <table width="100%" cellspacing="0" cellpadding="0" style="text-align: center;">
             
              <tbody>
                <tr style="font-size: 14px; color: #ffffff; background-color: #000000; text-align: center;">
                  <td
                    style="padding: 10px 15px; border-top: 1px solid #dedede;border-bottom: 1px solid #dedede;text-align: left; font-weight: 500;">
                    PRODUCT NAME
                  </td>
                  <td
                    style="padding: 10px 15px; border-top: 1px solid #dedede;border-bottom: 1px solid #dedede;text-align: left; font-weight: 500;">
                    PRICE
                  </td>
                  <td
                    style="padding: 10px 15px; border-top: 1px solid #dedede;border-bottom: 1px solid #dedede;text-align: left; font-weight: 500;">
                    QUANTITY
                  </td>
                  <td
                    style="padding: 10px 15px; border-top: 1px solid #dedede;border-bottom: 1px solid #dedede; font-weight: 500;">
                    TOTAL
                  </td>
                </tr>
                ${getOrderItems(data.items)}
              </tbody>
            </table>
          </td>
        </tr>
  
        <tr>
          <td colspan="2">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="0" style="text-align: right; padding: 20px 0 0;">
                      <tbody>
                        <tr>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px; color: #484848;">SUBTOTAL:
                          </td>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px;" width="250">
                            <strong>
                              ${data.subTotal}
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px; color: #484848;">DELIVERY FEE
                            </td>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px;" width="250">
                            <strong>
                              ${data.deliveryFee}
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px 20px; color: #484848;">APPLICABLE TAXES
                            </td>
                          <td style="font-size: 16px; line-height: 30px; padding: 5px 40px 20px;" width="250">
                            <strong>
                              ${data.taxes}
                            </strong>
                          </td>
                        </tr>
  
                        <tr style="background-color: #f8f8f8;">
                          <td style="font-size: 18px; line-height: 50px; padding: 0 40px; color: #484848;">
                            <strong>
                              TOTAL
                            </strong>
                          </td>
                          <td style="font-size: 18px; line-height: 50px; padding: 0 40px;" width="250">
                            <strong>
                              ${data.total}
                            </strong>
                          </td>
                        </tr>
  
                        <tr>
                          <td style="font-size: 16px; line-height: 30px; padding: 30px 40px; color: #484848;" colspan="2">
                            Thank you!
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
  
      </tbody>
    </table>
  </body>
  
  </html>`;
};

const getOrderInvoice = async (data) => {
  const html = getOrderHTML(data);

  const resolvedPath = path.resolve(__dirname, "..", data.orderId);

  return new Promise((res) =>
    htmlPdf
      .create(html, {
        format: "A3",
        timeout: 540000,
        childProcessOptions: {
          env: {
            OPENSSL_CONF: "/dev/null",
          },
        },
      })
      .toFile(`${resolvedPath}.pdf`, function (err) {
        if (err) {
          console.log(err);
          res({ status: false });
        }
        // console.log(res);
        res({ status: true, name: `${data.orderId}.pdf` });
      })
  );
};

// getOrderInvoice({
//   orderId: "123",
//   orderDate: "25-12-2023",
//   orderAmount: "﷼ 500 ",
//   addressName: "Badal Parnami",
//   addressHouseNo: "184",
//   addressStreet:
//     "Rajesh Parnami Book Centre, Gurunanakpura, Raja Park, Jaipur, Rajasthan, India",
//   addressCity: "Jaipur Division",
//   addressState: "Rajasthan",
//   items: [
//     { name: "First", price: "﷼ 50", quantity: 2, totalPrice: "100 ﷼" },
//     { name: "Second", price: "﷼ 100", quantity: 4, totalPrice: "400 ﷼" },
//   ],
//   subTotal: "﷼ 500",
//   deliveryFee: "﷼ 0",
//   taxes: "﷼ 0",
//   total: "﷼ 500",
// });

const removeFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      return;
    }
    return;
  });
};

const pushNotificationHelper = ({
  to,
  device,
  collapse_key,
  notification,
  data,
  _id,
}) => {
  const fcm = new FCM(FCM_SERVER_KEY);

  const iOSfields = {
    content_available: true,
    mutable_content: true,
  };

  let message = {
    to,
    collapse_key,
    notification,
    data,
  };

  if (device == "iOS") {
    message = { ...message, ...iOSfields };
  }

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong", err);
      // delete _id
    } else {
      // console.log("Successfully sent with response: ", response);
    }
  });
};


const userCartCounter = async (userId) => {
  let cartTotal = 0;

  try {
    cartTotal = await Cart.countDocuments({ customerId: userId });
  } catch (err) {
  }

  return cartTotal;
};

module.exports = {
  emailSend,
  decodeEntities,
  reduxSettingData,
  fileUpload,
  MONGODB_URI,
  checkExistEmailOrContact,
  ErrorMessageHandler,
  emailSendInLoop,
  translateHelper,
  HttpErrorResponse,
  parseIp,
  languages,
  newTokenHandler,
  findKeyPath,
  arrayMoveMutable,
  currencyExchangeRateHandler,
  getAllCategories,
  importFileDeleteHandler,
  mediaDownloadHandler,
  syncProductLinks,
  currentAndUSDCurrencyData,
  countryNameFromLatLng,
  isParentCategoriesActive,
  getChildCategories,
  getCurrencyDataByCode,
  sendNotification,
  allStatusObj,
  orderStatuses,
  activeStatusMap,
  returnStatusMap,
  orderStatusNotificationHandler,
  pendingPaymentHelper,
  successPaymentHelper,
  getOrderInvoice,
  pushNotificationHelper,
  getCountryByName,
  userCartCounter
};
