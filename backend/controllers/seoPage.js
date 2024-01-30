const ObjectId = require("mongoose").Types.ObjectId;

const SeoPage = require("../models/seoPage");
const SeoDescription = require("../models/seoDescription");
const HttpError = require("../http-error");

exports.create = async (req, res, next) => {
  let { data } = req.body;
  let {
    pageId,
    pageName,
    pageTitle,
    seoTitle,
    metaDescription,
    metaAuthor,
    metaKeywords,
    twitterCard,
    twitterSite,
    ogUrl,
    ogType,
    ogTitle,
    ogTag,
    ogAltTag,
    ogDescription,
    subData,
  } = JSON.parse(data);

  const updates = {};

  if (req.files["ogImage"] && req.files["ogImage"][0]) {
    updates.ogImage = req.files["ogImage"][0].path;
  }

  const newSeoPage = new SeoPage({
    pageId,
    pageName,
    pageTitle,
    seoTitle,
    metaDescription,
    metaAuthor,
    metaKeywords,
    twitterCard,
    twitterSite,
    ogUrl,
    ogType,
    ogTitle,
    ogTag,
    ogAltTag,
    ogDescription,
    ...updates,
  });

  let newSeo;
  try {
    newSeo = await newSeoPage.save();
    subData = subData.map((data) => ({ ...data, seoPage: newSeo._id }));
    SeoDescription.insertMany(subData);
  } catch (err) {
    const error = new HttpError("Could not create seo page.", 500);
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: "Seo Page Created Successfully",
  });
};

exports.update = async (req, res, next) => {
  let { data } = req.body;

  let {
    id,
    pageId,
    pageName,
    pageTitle,
    seoTitle,
    metaDescription,
    metaAuthor,
    metaKeywords,
    twitterCard,
    twitterSite,
    ogUrl,
    ogType,
    ogTitle,
    ogDescription,
    ogTag,
    ogAltTag,
    subData,
  } = JSON.parse(data);

  let seoPage, ogImage;
  try {
    seoPage = await SeoPage.findById(id).select({ ogImage: 1 }).lean();
    ogImage = await seoPage.ogImage;
  } catch (err) {
    const error = new HttpError("Could not edit seo page", 500);
    return next(error);
  }

  if (req.files["ogImage"] && req.files["ogImage"][0]) {
    ogImage = req.files["ogImage"][0].path;
  }

  try {
    await SeoPage.findByIdAndUpdate(id, {
      pageId,
      pageName,
      pageTitle,
      seoTitle,
      metaDescription,
      metaAuthor,
      metaKeywords,
      twitterCard,
      twitterSite,
      ogUrl,
      ogType,
      ogTitle,
      ogDescription,
      ogTag,
      ogAltTag,
      ogImage,
    });
  } catch (err) {
    const error = new HttpError("Could not edit seo page", 500);
    return next(error);
  }

  subData.forEach(async (d) => {
    try {
      await SeoDescription.findByIdAndUpdate(d.id, {
        pageName: d.pageName,
        pageTitle: d.pageTitle,
        metaDescription: d.metaDescription,
        metaAuthor: d.metaAuthor,
        metaKeywords: d.metaKeywords,
        twitterCard: d.twitterCard,
        ogTitle: d.ogTitle,
        ogDescription: d.ogDescription,
        ogAltTag: d.ogAltTag,
        ogTag: d.ogTag,
      });
    } catch (err) {
      const error = new HttpError("Could not update SEO' language data", 500);
      return next(error);
    }
  });

  res.status(200).json({
    status: true,
    message: "Seo page updated successfully.",
  });
};

exports.getAll = async (req, res, next) => {
  let { page, title, per_page, sortBy, order, dateFrom, dateTo } = req.query;
  if (!page) {
    const error = new HttpError("Page Query is required", 422);
    return next(error);
  }

  title = title ?? "";

  per_page = per_page ?? 10;

  let seoPages, totalDocuments;

  try {
    if (page == 1) {
      totalDocuments = await SeoPage.find({
        pageTitle: { $regex: title, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      seoPages = await SeoPage.find({
        pageTitle: { $regex: title, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      seoPages = await SeoPage.find({
        pageTitle: { $regex: title, $options: "i" },
        createdAt: {
          $gte: new Date(dateFrom),
          $lt: new Date(dateTo),
        },
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean();
    }
  } catch (err) {
    const error = new HttpError("Could not fetch seo pages", 500);
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Seo Pages Fetched successfully.",
    seoPages,
    totalDocuments,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let seoPage;
  try {
    // seoPage = await SeoPage.findById(id).lean();
    seoPage = await SeoPage.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "seodescriptions",
          localField: "_id",
          foreignField: "seoPage",
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
          data: {
            pageId: "$pageId",
            pageName: "$pageName",
            pageTitle: "$pageTitle",
            metaDescription: "$metaDescription",
            metaAuthor: "$metaAuthor",
            metaKeywords: "$metaKeywords",
            twitterCard: "$twitterCard",
            twitterSite: "$twitterSite",
            ogUrl: "$ogUrl",
            ogType: "$ogType",
            ogTitle: "$ogTitle",
            ogDescription: "$ogDescription",
            ogImage: "$ogImage",
            ogAltTag: "$ogAltTag",
            ogTag: "$ogTag",
          },
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            pageName: "$langData.pageName",
            pageTitle: "$langData.pageTitle",
            metaDescription: "$langData.metaDescription",
            metaAuthor: "$langData.metaAuthor",
            metaKeywords: "$langData.metaKeywords",
            twitterCard: "$langData.twitterCard",
            ogTitle: "$langData.ogTitle",
            ogDescription: "$langData.ogDescription",
            ogAltTag: "$langData.ogAltTag",
            ogTag: "$langData.ogTag",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          data: {
            $first: "$data",
          },
          languageData: {
            $push: "$languageData",
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError("Could not fetch seo page", 500);
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Seo Page Fetched successfully.",
    seoPage,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await SeoPage.findByIdAndDelete(id);
    await SeoDescription.deleteMany({ seoPage: ObjectId(id) });
  } catch (err) {
    const error = new HttpError("Could not delete seo page", 500);
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Seo Page Deleted Successfully.",
    id,
  });
};

exports.getOneBypageId = async (req, res, next) => {
  const { id: pageId } = req.params;

  let { language } = req.query;
  language = language ?? "en";

  let seoPageData;
  try {
    seoPageData = await SeoPage.aggregate([
      {
        $match: {
          pageId,
        },
      },
      {
        $lookup: {
          from: "seodescriptions",
          localField: "_id",
          foreignField: "seoPage",
          as: "langData",
        },
      },
      {
        $unwind: {
          path: "$langData",
        },
      },
      {
        $match: {
          "langData.languageCode": language,
        },
      },
      {
        $project: {
          pageId: "$pageId",
          pageName: "$langData.pageName",
          pageTitle: "$langData.pageTitle",
          metaDescription: "$langData.metaDescription",
          metaAuthor: "$langData.metaAuthor",
          metaKeywords: "$langData.metaKeywords",
          twitterCard: "$langData.twitterCard",
          twitterSite: "$twitterSite",
          ogUrl: "$ogUrl",
          ogType: "$ogType",
          ogTitle: "$langData.ogTitle",
          ogDescription: "$langData.ogDescription",
          ogTag: "$langData.ogTag",
          ogAltTag: "$langData.ogAltTag",
          ogImage: "$ogImage",
        },
      },
      {
        $sort: {
          orderNo: 1,
        },
      },
    ]);
  } catch (err) {
    // console.log(err);
    const error = new HttpError("Could not fetch seo page", 500);
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: "Seo Page Fetched successfully.",
    seoPageData,
  });
};
