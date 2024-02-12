const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;

const EmailTemplate = require("../../models/emailTemplate");

const Newsletter = require("../../models/newsletter");
const Master = require("../../models/master");
const HttpError = require("../../http-error");
const { decodeEntities, emailSend } = require("../../utils/helper");
const Cms = require("../../models/cms");
const { isParentCategoriesActive } = require("../../utils/helper");
const Reel = require("../../models/reel");
const Setting = require("../../models/setting");

const Product = require("../../models/product");
const ProductDescription = require("../../models/productDescription");

const sendMail = async (email, token, res, next) => {
  let emailTemplate;

  try {
    emailTemplate = await EmailTemplate.findOne({
      name: "Newsletter Subscription",
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while sending newsletter subscription email.",
      500
    );
    return next(error);
  }

  let message = emailTemplate.body;
  //   message = message.replace(/\{USER_NAME\}/g, "User");

  //   message = message.replace(/\{USER_EMAIL\}/g, email);
  message = message.replace(
    /\{VERIFICATION_LINK\}/g,
    `${process.env.FRONTEND_URL}?verify=${token}`
  );
  message = decodeEntities(message);

  const subject = emailTemplate.subject;

  emailSend(res, next, email, subject, message, {});
};

exports.subscribeNewsletter = async (req, res, next) => {
  const { email } = req.body;

  if (!email || email.trim().length === 0) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Please provide email to subscribe newsletter.",
      422
    );
    return next(error);
  }

  const token = jwt.sign({ email: email }, process.env.JWT);

  try {
    const data = await Newsletter.findOne({ email, isDeleted: false });

    if (data) {
      if (data.isVerified) {
        res.status(200).json({
          status: true,
          alreadySubscribed: 1,
          message: "You have already subscribed to newsletter.",
        });
      } else {
        await Newsletter.findByIdAndUpdate(data._id, { token });
        sendMail(email, token, res, next);
      }
    } else {
      let newData = new Newsletter({ email, token });
      await newData.save();
      sendMail(email, token, res, next);
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while subscribing newsletter.",
      500
    );
    return next(error);
  }
};

exports.verifyNewsletterSubscription = async (req, res, next) => {
  const { token } = req.body;

  if (!token || token.trim().length === 0) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Invalid data sent.",
      422
    );
    return next(error);
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT);
  } catch (err) {
    return res.status(200).json({
      status: false,
    });
  }

  let { email } = decodedToken;

  try {
    const data = await Newsletter.findOne({ email, token, isDeleted: false });

    if (data) {
      if (data.isVerified) {
        res.status(200).json({
          status: true,
          message: "Your newsletter subscription has already verified.",
        });
      } else {
        await Newsletter.findOneAndUpdate(
          { email },
          {
            $set: {
              isVerified: true,
            },
            $unset: {
              token: 1,
            },
          }
        );

        return res.status(200).json({
          status: true,
          message: "Newsletter subcription has been verified successfully.",
        });
      }
    } else {
      return res.status(200).json({ status: false });
    }
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "Something went wrong while verifying newsletter subscription.",
    });
  }
};

exports.getHomePageData = async (req, res, next) => {
  const language = req.languageCode;
  const userId = req.userId;

  let homePageSectionOne,
    homePageSectionOneSlider,
    homePageSectionTwo,
    homePageSectionThree,
    homePageSectionFour,
    homePageSectionFive,
    aboutUs,
    reels,
    homePagePermission;

  try {
    homePageSectionOne = Master.aggregate([
      {
        $match: {
          key: "home-section-one",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          linkOne: 1,
          linkTwo: 1,
          linkThree: 1,
          imageOne: "$langData.imageOne",
          imageTwo: "$langData.imageTwo",
          imageThree: "$langData.imageThree",
        },
      },
    ]);

    homePageSectionOneSlider = Master.aggregate([
      {
        $match: {
          key: "home-section-one-slider",
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          link: 1,
          image: "$langData.image",
        },
      },
    ]);

    homePageSectionTwo = Master.aggregate([
      {
        $match: {
          key: "home-section-two",
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          link: 1,
          image: "$langData.image",
          title: "$langData.title",
          heading: "$langData.heading",
          description: "$langData.description",
          buttonName: "$langData.buttonName",
          backgroundColor: "$colorPicker",
        },
      },
    ]);

    homePageSectionThree = Master.aggregate([
      {
        $match: {
          key: "home-section-three",
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          link: 1,
          image: "$langData.image",
        },
      },
    ]);

    homePageSectionFour = Master.aggregate([
      {
        $match: {
          key: "home-section-four",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          link: 1,
          backgroundColor: 1,
          image: "$langData.image",
          heading: "$langData.heading",
          buttonName: "$langData.buttonName",
        },
      },
    ]);

    homePageSectionFive = Master.aggregate([
      {
        $match: {
          key: "home-section-five",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$mainPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          _id: 0,
          image: "$langData.image",
        },
      },
    ]);

    aboutUs = Cms.aggregate([
      {
        $match: {
          name: "About",
        },
      },
      {
        $lookup: {
          from: "cmsdescriptions",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$cmsPage", "$$id"],
                    },
                  },
                  {
                    $expr: {
                      $eq: ["$languageCode", language],
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
        $unwind: {
          path: "$langData",
        },
      },
      {
        $project: {
          title: "$langData.title",
          description: "$langData.description",
        },
      },
    ]);

    reels = Reel.aggregate([
      {
        $match: {
          type: "productPromotional",
          status: "Published",
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: "reelreactions",
          let: {
            reelId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$reelId", "$reelId"],
                },
                userId: new ObjectId(userId ?? null),
              },
            },
          ],
          as: "reaction",
        },
      },
      {
        $project: {
          video: 1,
          vendorName: "Noonmar",
          // image: "/assets/img/favicon/ms-icon-310x310.png",
          isLiked: {
            $cond: [
              {
                $eq: [
                  {
                    $size: "$reaction",
                  },
                  1,
                ],
              },
              true,
              false,
            ],
          },
          isAdmin: {
            $toBool: "true",
          },
          shareUrl: {
            $concat: [
              process.env.FRONTEND_URL,
              "/reel/",
              {
                $toString: "$_id",
              },
            ],
          },
        },
      },
    ]);

    homePagePermission = Master.aggregate([
      {
        $match: {
          key: "home-page-permission",
        },
      },
      {
        $project: {
          _id: 0,
          isShow: 1,
          name: 1,
          code: 1,
        },
      },
    ]);

    [
      [homePageSectionOne],
      homePageSectionOneSlider,
      homePageSectionTwo,
      homePageSectionThree,
      [homePageSectionFour],
      [homePageSectionFive],
      [aboutUs],
      reels,
      homePagePermission,
    ] = await Promise.all([
      homePageSectionOne,
      homePageSectionOneSlider,
      homePageSectionTwo,
      homePageSectionThree,
      homePageSectionFour,
      homePageSectionFive,
      aboutUs,
      reels,
      homePagePermission,
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
  if (homePagePermission.length > 0) {
    homePagePermission = homePagePermission.reduce((acc, curr) => {
      acc[curr.code] = curr.isShow;
      return acc;
    }, {});
  }
  res.status(200).json({
    status: true,
    message: "Home page data fatched successfully.",
    data: {
      homePageSectionOne,
      homePageSectionOneSlider,
      homePageSectionTwo,
      homePageSectionThree,
      homePageSectionFour,
      homePageSectionFive,
      aboutUs,
      reels,
      homePagePermission,
    },
  });
};

exports.search = async (req, res, next) => {
  const { term } = req.query;
  const countryId = req.countryId;
  const language = req.languageCode;

  let results;

  try {
    let productSearch = [
      {
        $match: {
          name: { $regex: term, $options: "i" },
          languageCode: language,
        },
      },
      {
        $lookup: {
          from: "productdescriptions",
          localField: "productId",
          foreignField: "productId",
          pipeline: [
            {
              $match: {
                languageCode: "en",
              },
            },
          ],
          as: "productdescriptions",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                isApproved: true,
                isPublished: true,
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "vendorproducts",
                localField: "_id",
                foreignField: "productId",
                pipeline: [
                  {
                    $match: {
                      isDeleted: false,
                      isActive: true,
                    },
                  },
                ],
                as: "vendorData",
              },
            },
            {
              $unwind: {
                path: "$vendorData",
              },
            },
          ],
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
        },
      },
      {
        $project: {
          _id: 1,
          name: "$name",
          slug: "$productdescriptions.slug",
          vendor: "$product.vendorData.vendorId",
          searchType: "product",
        },
      },
      {
        $unionWith: {
          coll: "productcategories",
          pipeline: [
            { $match: { isActive: true, isDeleted: false } },
            {
              $lookup: {
                from: "productcategorydescriptions",
                localField: "_id",
                foreignField: "productCategoryId",
                pipeline: [
                  {
                    $match: {
                      name: { $regex: term, $options: "i" },
                      languageCode: language,
                    },
                  },
                ],
                as: "categorydescriptions",
              },
            },
            {
              $unwind: {
                path: "$categorydescriptions",
              },
            },
            {
              $project: {
                _id: 1,
                name: "$categorydescriptions.name",
                slug: "$categorydescriptions.slug",
                searchType: "productCategory",
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "brands",
          pipeline: [
            { $match: { isActive: true, isDeleted: false } },
            {
              $lookup: {
                from: "masterdescriptions",
                localField: "_id",
                foreignField: "mainPage",
                pipeline: [
                  {
                    $match: {
                      key: "brand",
                      name: { $regex: term, $options: "i" },
                      languageCode: language,
                    },
                  },
                ],
                as: "branddescriptions",
              },
            },
            {
              $unwind: {
                path: "$branddescriptions",
              },
            },
            {
              $project: {
                _id: 1,
                name: "$branddescriptions.name",
                slug: "$branddescriptions.slug",
                searchType: "brand",
              },
            },
          ],
        },
      },
    ];

    results = await ProductDescription.aggregate(productSearch);
    res.status(200).json({
      status: true,
      message: "Search data found successfully.",
      results: results,
    });
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
};

exports.search_old = async (req, res, next) => {
  const { term } = req.query;
  const countryId = req.countryId;
  const language = req.languageCode;

  let results;

  try {
    results = await Cms.aggregate([
      {
        $limit: 1,
      },
      {
        $project: {
          _id: "$$REMOVE",
        },
      },
      {
        $lookup: {
          from: "products",
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    name: new RegExp(term, "i"),
                    isApproved: true,
                    isPublished: true,
                    isActive: true,
                    isDeleted: false,
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "vendorproducts",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$productId", "$$id"],
                      },
                      isDeleted: false,
                      isActive: true,
                    },
                  },
                ],
                as: "vendorData",
              },
            },
            {
              $unwind: {
                path: "$vendorData",
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
                          isActive: true,
                          isDeleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      parentId: 1,
                    },
                  },
                ],
                as: "masterCategoryData",
              },
            },
            {
              $unwind: {
                path: "$masterCategoryData",
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
                          isActive: true,
                          isDeleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: "brandData",
              },
            },
            {
              $unwind: {
                path: "$brandData",
              },
            },
            {
              $lookup: {
                from: "productvariants",
                let: {
                  id: "$_id",
                  vendorId: "$vendorData.vendorId",
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
                        {
                          $expr: {
                            $eq: ["$isActive", true],
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
                                languageCode: language,
                              },
                            ],
                          },
                        },
                        {
                          $project: {
                            name: 1,
                            slug: 1,
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
                    $lookup: {
                      from: "vendorproductvariants",
                      let: {
                        productVariantId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$productVariantId", "$$productVariantId"],
                            },
                            isDeleted: false,
                            isActive: true,
                            $and: [
                              {
                                $expr: {
                                  $eq: ["$vendorId", "$$vendorId"],
                                },
                              },
                            ],
                          },
                        },
                        {
                          $sort: {
                            createdAt: 1,
                          },
                        },
                        {
                          $limit: 1,
                        },
                      ],
                      as: "vendorData",
                    },
                  },
                  {
                    $unwind: {
                      path: "$vendorData",
                    },
                  },
                ],
                as: "variantData",
              },
            },
            {
              $unwind: {
                path: "$variantData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $match: {
                $or: [
                  {
                    $and: [
                      {
                        $expr: {
                          $gt: [
                            {
                              $size: "$variants",
                            },
                            0,
                          ],
                        },
                      },
                      {
                        "variantData._id": {
                          $exists: true,
                        },
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $eq: [
                            {
                              $size: "$variants",
                            },
                            0,
                          ],
                        },
                      },
                      {
                        "variantData._id": {
                          $exists: false,
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              $sort: {
                "vendorData.createdAt": 1,
              },
            },
            {
              $group: {
                _id: {
                  $cond: [
                    "$variantData",
                    {
                      $concat: [
                        {
                          $toString: "$_id",
                        },
                        {
                          $toString: "$variantData._id",
                        },
                      ],
                    },
                    {
                      $concat: [
                        {
                          $toString: "$_id",
                        },
                        {
                          $toString: "$vendorData._id",
                        },
                      ],
                    },
                  ],
                },
                doc: {
                  $first: "$$ROOT",
                },
              },
            },
            {
              $replaceRoot: {
                newRoot: "$doc",
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
                      $expr: {
                        $eq: ["$productId", "$$id"],
                      },
                      languageCode: language,
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
              $addFields: {
                slug: {
                  $ifNull: ["$variantData.langData.slug", "$langData.slug"],
                },
              },
            },
            {
              $project: {
                name: {
                  $cond: [
                    "$variantData",
                    {
                      $cond: [
                        "$variantData.secondVariantName",
                        {
                          $concat: [
                            "$langData.name",
                            " (",
                            "$variantData.firstSubVariantName",
                            ",",
                            "$variantData.secondSubVariantName",
                            ")",
                          ],
                        },
                        {
                          $concat: [
                            "$langData.name",
                            " (",
                            "$variantData.firstSubVariantName",
                            ")",
                          ],
                        },
                      ],
                    },
                    "$langData.name",
                  ],
                },
                slug: 1,
                searchType: "product",
                vendor: {
                  $ifNull: [
                    "$variantData.vendorData.vendorId",
                    "$vendorData.vendorId",
                  ],
                },
                category: "$masterCategoryData",
              },
            },
          ],
          as: "products",
        },
      },
      {
        $lookup: {
          from: "productcategorydescriptions",
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    name: new RegExp(term, "i"),
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "productcategories",
                let: {
                  id: "$productCategoryId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$_id", "$$id"],
                          },
                          isActive: true,
                          isDeleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      parentId: 1,
                      slug: 1,
                    },
                  },
                ],
                as: "catData",
              },
            },
            {
              $unwind: {
                path: "$catData",
              },
            },
            {
              $lookup: {
                from: "productcategorydescriptions",
                let: {
                  id: "$productCategoryId",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$productCategoryId", "$$id"],
                          },
                          languageCode: language,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      slug: 1,
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
                name: "$langData.name",
                slug: "$langData.slug",
                searchType: "productCategory",
                category: "$catData",
              },
            },
            {
              $group: {
                _id: "$category._id",
                doc: { $first: "$$ROOT" },
              },
            },
            {
              $replaceRoot: {
                newRoot: "$doc",
              },
            },
          ],
          as: "productCategories",
        },
      },

      {
        $lookup: {
          from: "masterdescriptions",
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    name: new RegExp(term, "i"),
                  },
                  {
                    key: "brand",
                  },
                  {
                    slug: {
                      $exists: true, // added because language wise slug was created much later
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "brands",
                let: {
                  id: "$mainPage",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$_id", "$$id"],
                          },
                          isActive: true,
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
                as: "brandData",
              },
            },
            {
              $unwind: {
                path: "$brandData",
              },
            },
            {
              $lookup: {
                from: "masterdescriptions",
                let: {
                  id: "$mainPage",
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $eq: ["$mainPage", "$$id"],
                          },
                          languageCode: language,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      slug: 1,
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
                name: "$langData.name",
                slug: "$langData.slug",
                searchType: "brand",
              },
            },
          ],
          as: "brands",
        },
      },

      {
        $project: {
          union: {
            $concatArrays: ["$products", "$productCategories", "$brands"],
          },
        },
      },
      {
        $unwind: {
          path: "$union",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$union",
        },
      },
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

  console.log(results, "allsearch");

  res.status(200).json({
    status: true,
    message: "Search data found successfully.",
    results: results,
  });
};

exports.getReviewFileLimit = async (req, res, next) => {
  let fileLimit = 5;

  try {
    let setting = await Setting.findOne({
      key: "Review.files",
    }).lean();

    fileLimit = +setting.value;
  } catch (err) {}

  res.status(200).json({
    status: true,
    message: "Review file limit fetched successfully",
    fileLimit,
  });
};
