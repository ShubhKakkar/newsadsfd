const axios = require("axios");
const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;

const AdminRole = require("../models/subAdminRole");
const Master = require("../models/master");
const HttpError = require("../http-error");
const MasterDescription = require("../models/masterDescription");
const { translateHelper } = require("../utils/helper");

exports.postEmployeeCount = async (req, res, next) => {
  const { employeeCounts } = req.body;

  let empCount;

  try {
    empCount = await Master.findOne({ key: "employeeCount" }).lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  if (!empCount) {
    const newEmp = new Master({
      key: "employeeCount",
      employeeCounts,
    });

    try {
      await newEmp.save();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
  } else {
    try {
      await Master.findByIdAndUpdate(empCount._id, { employeeCounts });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
  }

  res.status(201).json({
    status: true,
    message: "Successful",
  });
};

exports.getAllRoles = async (req, res, next) => {
  let roles;

  try {
    roles = await AdminRole.find({ isActive: true, isDeleted: false })
      .select({ role: 1, permissions: 1 })
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching roles.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Roles fetched successfully.",
    roles,
  });
};

exports.postHomeAboutUs = async (req, res, next) => {
  let { data, subData } = req.body;

  let { aboutUs } = JSON.parse(data);

  subData = JSON.parse(subData);

  let newMaster = new Master({
    key: "homepage-about-us",
    aboutUs,
  });

  try {
    await newMaster.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => ({
    ...data,
    masterPage: newMaster._id,
  }));

  MasterDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: translateHelper(req, "About Us Created Successfully"),
      })
    )
    .catch((err) => {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create about us`,
        500
      );
      return next(error);
    });
};

exports.getHomeAboutUs = async (req, res, next) => {
  let data;

  let { id } = req.params;

  try {
    data = await Master.aggregate([
      {
        $match: {
          key: "homepage-about-us",
          _id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "masterPage",
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
          languageData: {
            id: "$langData._id",
            languageCode: "$langData.languageCode",
            aboutUs: "$langData.aboutUs",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          // data: {
          //   $first: "$data",
          // },
          languageData: {
            $push: "$languageData",
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "About Us data fetched successfully",
    data,
  });
};

/* SECTION 1 */

exports.postHomeSection1 = async (req, res, next) => {
  let { data, subData, fileIndexes, id } = req.body;

  data = JSON.parse(data);

  subData = JSON.parse(subData);

  fileIndexes = JSON.parse(fileIndexes);

  const { linkOne, linkTwo, linkThree } = data;

  if (!id) {
    const [imageOne, imageTwo, imageThree] = req.files.image;

    const files = req.files.image;

    subData = files
      .map((file, i) => {
        return {
          languageCode: fileIndexes[i].split("-")[1],
          [fileIndexes[i].split("-")[0]]: file.path,
        };
      })
      .reduce((acc, cv) => {
        const idx = acc.findIndex((a) => a.languageCode === cv.languageCode);
        if (idx !== -1) {
          delete cv.languageCode;
          acc[idx] = { ...acc[idx], ...cv };
        } else {
          acc.push(cv);
        }
        return acc;
      }, []);

    let newMaster = new Master({
      key: "home-section-one",
      imageOne: imageOne.path,
      imageTwo: imageTwo.path,
      imageThree: imageThree.path,
      linkOne,
      linkTwo,
      linkThree,
    });

    try {
      await newMaster.save();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    subData = subData.map((data) => ({
      ...data,
      mainPage: newMaster._id,
      key: "home-section-one",
    }));

    MasterDescription.insertMany(subData)
      .then((response) =>
        res.status(201).json({
          status: true,
          message: translateHelper(req, "Section one Created Successfully"),
        })
      )
      .catch((err) => {
        console.log(err);
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          `Could not create section one`,
          500
        );
        return next(error);
      });
  } else {
    const files = req.files.image;
    let subDataTwo = [];

    if (files) {
      subDataTwo = files
        .map((file, i) => {
          return {
            languageCode: fileIndexes[i].split("-")[1],
            [fileIndexes[i].split("-")[0]]: file.path,
          };
        })
        .reduce((acc, cv) => {
          const idx = acc.findIndex((a) => a.languageCode === cv.languageCode);
          if (idx !== -1) {
            delete cv.languageCode;
            acc[idx] = { ...acc[idx], ...cv };
          } else {
            acc.push(cv);
          }
          return acc;
        }, []);
    }

    const isMain = subDataTwo.find((s) => s.languageCode === "en");

    let mainUpdates = {};

    if (isMain) {
      mainUpdates = { ...isMain };
    }

    try {
      await Master.findByIdAndUpdate(id, {
        $set: {
          ...mainUpdates,
          linkOne,
          linkTwo,
          linkThree,
        },
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    const promises = [];

    for (let i = 0; i < subData.length; i++) {
      const lang = subData[i].languageCode;

      const isExist = subDataTwo.find((s) => s.languageCode === lang);

      if (isExist) {
        promises.push(
          MasterDescription.findByIdAndUpdate(subData[i].id, {
            $set: isExist,
          })
        );
      }
    }

    try {
      await Promise.all(promises);
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: translateHelper(req, "Section one updated successfully"),
    });
  }
};

exports.getHomeSection1 = async (req, res, next) => {
  let getHomeSectionOne;
  try {
    [getHomeSectionOne] = await Master.aggregate([
      {
        $match: {
          key: "home-section-one",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "sectionOneData",
        },
      },
      {
        $unwind: {
          path: "$sectionOneData",
        },
      },
      {
        $project: {
          linkOne: 1,
          linkTwo: 1,
          linkThree: 1,
          imageOne: "$imageOne",
          imageTwo: "$imageTwo",
          imageThree: "$imageThree",
          langData: {
            id: "$sectionOneData._id",
            languageCode: "$sectionOneData.languageCode",
            imageOne: "$sectionOneData.imageOne",
            imageTwo: "$sectionOneData.imageTwo",
            imageThree: "$sectionOneData.imageThree",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          linkOne: {
            $first: "$linkOne",
          },
          linkTwo: {
            $first: "$linkTwo",
          },
          linkThree: {
            $first: "$linkThree",
          },
          langData: {
            $push: "$langData",
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Could not create about us`,
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section one fetched successfully"),
    getHomeSectionOne,
  });
};

/* SECTION 1 - SLIDER */

exports.postHomeSection1Slider = async (req, res, next) => {
  let { fileIndexes, subData, link } = req.body;
  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  const subDataTwo = files.map((file, i) => {
    return {
      languageCode: fileIndexes[i].split("-")[1],
      image: file.path,
    };
  });

  let newMaster = new Master({
    key: "home-section-one-slider",
    ...subDataTwo.find((s) => s.languageCode === "en"),
    link,
    isDeleted: false,
  });

  try {
    await newMaster.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => {
    const imageData = subDataTwo.find((s) => s.languageCode === data.code);

    const updates = {
      languageCode: data.code,
    };

    if (imageData) {
      updates.image = imageData.image;
    }

    return {
      mainPage: newMaster._id,
      key: "home-section-one-slider",
      ...updates,
    };
  });

  MasterDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: translateHelper(
          req,
          "Section one's slider created successfully"
        ),
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create section one's slider`,
        500
      );
      return next(error);
    });
};

exports.getAllHomeSection1Sliders = async (req, res, next) => {
  const { order, page, per_page } = req.query;

  let sliders, totalDocuments;

  try {
    sliders = await Master.aggregate([
      {
        $match: {
          key: "home-section-one-slider",
          isDeleted: false,
        },
      },
      {
        $sort: {
          createdAt: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * +per_page,
      },
      {
        $limit: +per_page,
      },
      {
        $project: {
          link: 1,
          image: 1,
          createdAt: 1,
        },
      },
    ]);

    totalDocuments = await Master.find({
      key: "home-section-one-slider",
      isDeleted: false,
    }).countDocuments();
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
    message: "Data fetched successfully.",
    sliders,
    totalDocuments,
  });
};

exports.getOneHomeSection1Slider = async (req, res, next) => {
  const { id } = req.params;

  let sliderData;

  try {
    [sliderData] = await Master.aggregate([
      {
        $match: {
          key: "home-section-one-slider",
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $project: {
          link: 1,
          langData: {
            _id: 1,
            languageCode: 1,
            image: 1,
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

  res
    .status(200)
    .json({ status: true, message: "Slider fetched successfully", sliderData });
};

exports.putHomeSection1Slider = async (req, res, next) => {
  let { fileIndexes, subData, id, link } = req.body;

  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  let subDataTwo = [];

  if (files) {
    subDataTwo = files.map((file, i) => {
      return {
        languageCode: fileIndexes[i].split("-")[1],
        image: file.path,
      };
    });
  }

  const isMain = subDataTwo.find((s) => s.languageCode === "en");

  let mainUpdates = {
    link,
  };

  if (isMain) {
    mainUpdates = { ...mainUpdates, ...isMain };
  }

  try {
    await Master.findByIdAndUpdate(id, {
      $set: mainUpdates,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const promises = [];

  for (let i = 0; i < subData.length; i++) {
    const lang = subData[i].languageCode;

    const isExist = subDataTwo.find((s) => s.languageCode === lang);

    if (isExist) {
      promises.push(
        MasterDescription.findByIdAndUpdate(subData[i].id, {
          $set: isExist,
        })
      );
    }
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section one updated successfully"),
  });
};

exports.deleteHomeSection1Sliders = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Slider deleted successfully."),
    id,
  });
};

/* SECTION 2 */

exports.postHomeSection2 = async (req, res, next) => {
  let { fileIndexes, subData, link, colorPicker } = req.body;

  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  const subDataTwo = files.map((file, i) => {
    return {
      code: fileIndexes[i].split("-")[1],
      image: file.path,
    };
  });

  let newMaster = new Master({
    key: "home-section-two",
    ...subDataTwo.find((s) => s.code === "en"),
    ...subData.find((s) => s.code === "en"),
    link,
    colorPicker,
    isDeleted: false,
  });

  try {
    await newMaster.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => {
    const imageData = subDataTwo.find((s) => s.code === data.code);

    const updates = {
      languageCode: data.code,
      ...data,
    };

    if (imageData) {
      updates.image = imageData.image;
    }

    return {
      mainPage: newMaster._id,
      key: "home-section-two",
      ...updates,
    };
  });

  MasterDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: translateHelper(req, "Section two created successfully."),
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create section two.`,
        500
      );
      return next(error);
    });
};

exports.getAllHomeSection2 = async (req, res, next) => {
  const { order, page, per_page } = req.query;

  let sections, totalDocuments;

  try {
    sections = await Master.aggregate([
      {
        $match: {
          key: "home-section-two",
          isDeleted: false,
        },
      },
      {
        $sort: {
          createdAt: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * +per_page,
      },
      {
        $limit: +per_page,
      },
      {
        $project: {
          title: 1,
          heading: 1,
          description: 1,
          buttonName: 1,
          link: 1,
          createdAt: 1,
        },
      },
    ]);

    totalDocuments = await Master.find({
      key: "home-section-two",
      isDeleted: false,
    }).countDocuments();
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
    message: "Data fetched successfully.",
    sections,
    totalDocuments,
  });
};

exports.getOneHomeSection2 = async (req, res, next) => {
  const { id } = req.params;

  let sectionData;

  try {
    [sectionData] = await Master.aggregate([
      {
        $match: {
          key: "home-section-two",
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $project: {
          link: 1,
          colorPicker: 1,
          langData: {
            _id: 1,
            languageCode: 1,
            image: 1,
            title: 1,
            heading: 1,
            description: 1,
            buttonName: 1,
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

  res.status(200).json({
    status: true,
    message: "Section fetched successfully",
    sectionData,
  });
};

exports.putHomeSection2 = async (req, res, next) => {
  let { fileIndexes, subData, id, link, colorPicker } = req.body;

  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  let subDataTwo = [];

  if (files) {
    subDataTwo = files.map((file, i) => {
      return {
        code: fileIndexes[i].split("-")[1],
        image: file.path,
      };
    });
  }

  const isMain = subDataTwo.find((s) => s.code === "en");

  let mainUpdates = {
    link,
    colorPicker,
    ...subData.find((s) => s.languageCode === "en"),
  };

  if (isMain) {
    mainUpdates = { ...mainUpdates, ...isMain };
  }

  try {
    await Master.findByIdAndUpdate(id, {
      $set: mainUpdates,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const promises = [];

  for (let i = 0; i < subData.length; i++) {
    const lang = subData[i].languageCode;

    const isExist = subDataTwo.find((s) => s.code === lang);

    let updates = {
      link,
      colorPicker,
      ...subData.find((s) => s.languageCode === lang),
    };

    if (isExist) {
      updates = { ...updates, ...isExist };
    }

    promises.push(
      MasterDescription.findByIdAndUpdate(subData[i].id, {
        $set: updates,
      })
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section updated successfully"),
  });
};

exports.deleteHomeSection2 = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section deleted successfully."),
    id,
  });
};

/* SECTION 3 */

exports.postHomeSection3 = async (req, res, next) => {
  let { fileIndexes, subData, link } = req.body;
  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  const subDataTwo = files.map((file, i) => {
    return {
      languageCode: fileIndexes[i].split("-")[1],
      image: file.path,
    };
  });

  let newMaster = new Master({
    key: "home-section-three",
    ...subDataTwo.find((s) => s.languageCode === "en"),
    link,
    isDeleted: false,
  });

  try {
    await newMaster.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  subData = subData.map((data) => {
    const imageData = subDataTwo.find((s) => s.languageCode === data.code);

    const updates = {
      languageCode: data.code,
    };

    if (imageData) {
      updates.image = imageData.image;
    }

    return {
      mainPage: newMaster._id,
      key: "home-section-three",
      ...updates,
    };
  });

  MasterDescription.insertMany(subData)
    .then((response) =>
      res.status(201).json({
        status: true,
        message: translateHelper(req, "Section created successfully"),
      })
    )
    .catch((err) => {
      console.log(err);
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        `Could not create section`,
        500
      );
      return next(error);
    });
};

exports.getAllHomeSection3 = async (req, res, next) => {
  const { order, page, per_page } = req.query;

  let sections, totalDocuments;

  try {
    sections = await Master.aggregate([
      {
        $match: {
          key: "home-section-three",
          isDeleted: false,
        },
      },
      {
        $sort: {
          createdAt: order == "asc" ? 1 : -1,
        },
      },
      {
        $skip: (+page - 1) * +per_page,
      },
      {
        $limit: +per_page,
      },
      {
        $project: {
          link: 1,
          image: 1,
          createdAt: 1,
        },
      },
    ]);

    totalDocuments = await Master.find({
      key: "home-section-three",
      isDeleted: false,
    }).countDocuments();
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
    message: "Data fetched successfully.",
    sections,
    totalDocuments,
  });
};

exports.getOneHomeSection3 = async (req, res, next) => {
  const { id } = req.params;

  let sectiondata;

  try {
    [sectiondata] = await Master.aggregate([
      {
        $match: {
          key: "home-section-three",
          isDeleted: false,
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $project: {
          link: 1,
          langData: {
            _id: 1,
            languageCode: 1,
            image: 1,
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

  res.status(200).json({
    status: true,
    message: "Section fetched successfully",
    sectiondata,
  });
};

exports.putHomeSection3 = async (req, res, next) => {
  let { fileIndexes, subData, id, link } = req.body;

  fileIndexes = JSON.parse(fileIndexes);
  subData = JSON.parse(subData);

  const files = req.files.image;

  let subDataTwo = [];

  if (files) {
    subDataTwo = files.map((file, i) => {
      return {
        languageCode: fileIndexes[i].split("-")[1],
        image: file.path,
      };
    });
  }

  const isMain = subDataTwo.find((s) => s.languageCode === "en");

  let mainUpdates = {
    link,
  };

  if (isMain) {
    mainUpdates = { ...mainUpdates, ...isMain };
  }

  try {
    await Master.findByIdAndUpdate(id, {
      $set: mainUpdates,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  const promises = [];

  for (let i = 0; i < subData.length; i++) {
    const lang = subData[i].languageCode;

    const isExist = subDataTwo.find((s) => s.languageCode === lang);

    if (isExist) {
      promises.push(
        MasterDescription.findByIdAndUpdate(subData[i].id, {
          $set: isExist,
        })
      );
    }
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section updated successfully"),
  });
};

exports.deleteHomeSection3 = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section deleted successfully."),
    id,
  });
};

/* SECTION 4 */

exports.postHomeSection4 = async (req, res, next) => {
  let { data, subData, fileIndexes, id } = req.body;

  data = JSON.parse(data);

  subData = JSON.parse(subData);

  fileIndexes = JSON.parse(fileIndexes);

  if (!id) {
    const files = req.files.image;

    const subDataTwo = files.map((file, i) => {
      return {
        languageCode: fileIndexes[i].split("-")[1],
        [fileIndexes[i].split("-")[0]]: file.path,
      };
    });

    let newMaster = new Master({
      key: "home-section-four",
      ...subDataTwo.find((s) => s.languageCode === "en"),
      ...data,
    });

    try {
      await newMaster.save();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    subData = subData.map((data) => {
      let updates = {};

      if (subDataTwo.find((s) => s.languageCode === data.languageCode)) {
        updates = subDataTwo.find((s) => s.languageCode === data.languageCode);
      }

      return {
        ...data,
        ...updates,
        mainPage: newMaster._id,
        key: "home-section-four",
      };
    });

    MasterDescription.insertMany(subData)
      .then((response) =>
        res.status(201).json({
          status: true,
          message: translateHelper(req, "Section four Created Successfully"),
        })
      )
      .catch((err) => {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          `Could not create section four`,
          500
        );
        return next(error);
      });
  } else {
    const files = req.files.image;

    let subDataTwo = [];

    if (files) {
      subDataTwo = files.map((file, i) => {
        return {
          languageCode: fileIndexes[i].split("-")[1],
          [fileIndexes[i].split("-")[0]]: file.path,
        };
      });
    }

    const isMain = subDataTwo.find((s) => s.languageCode === "en");

    let mainUpdates = {};

    if (isMain) {
      mainUpdates = { ...isMain };
    }

    try {
      await Master.findByIdAndUpdate(id, {
        $set: {
          ...mainUpdates,
          ...data,
        },
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    const promises = [];

    for (let i = 0; i < subData.length; i++) {
      const lang = subData[i].languageCode;

      const isExist = subDataTwo.find((s) => s.languageCode === lang);

      let updates = {
        heading: subData[i].heading,
        buttonName: subData[i].buttonName,
      };

      if (isExist) {
        updates = { ...updates, ...isExist };
      }

      promises.push(
        MasterDescription.findByIdAndUpdate(subData[i].id, {
          $set: updates,
        })
      );
    }

    try {
      await Promise.all(promises);
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: translateHelper(req, "Section updated successfully"),
    });
  }
};

exports.getHomeSection4 = async (req, res, next) => {
  let sectionData;

  try {
    [sectionData] = await Master.aggregate([
      {
        $match: {
          key: "home-section-four",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $project: {
          link: 1,
          backgroundColor: 1,
          imageOne: "$imageOne",
          imageTwo: "$imageTwo",
          imageThree: "$imageThree",
          langData: {
            _id: 1,
            heading: 1,
            buttonName: 1,
            languageCode: 1,
            image: 1,
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Could not create about us`,
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section four fetched successfully"),
    sectionData,
  });
};

/* SECTION 5 */

exports.postHomeSection5 = async (req, res, next) => {
  let { subData, fileIndexes, id } = req.body;

  subData = JSON.parse(subData);

  fileIndexes = JSON.parse(fileIndexes);

  if (!id) {
    const files = req.files.image;

    const subDataTwo = files.map((file, i) => {
      return {
        languageCode: fileIndexes[i].split("-")[1],
        [fileIndexes[i].split("-")[0]]: file.path,
      };
    });

    let newMaster = new Master({
      key: "home-section-five",
      ...subDataTwo.find((s) => s.languageCode === "en"),
    });

    try {
      await newMaster.save();
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    subData = subData.map((data) => {
      let updates = {};

      if (subDataTwo.find((s) => s.languageCode === data.languageCode)) {
        updates = subDataTwo.find((s) => s.languageCode === data.languageCode);
      }

      return {
        ...data,
        ...updates,
        mainPage: newMaster._id,
        key: "home-section-five",
      };
    });

    MasterDescription.insertMany(subData)
      .then((response) =>
        res.status(201).json({
          status: true,
          message: translateHelper(req, "Section five Created Successfully"),
        })
      )
      .catch((err) => {
        const error = new HttpError(
          req,
          new Error().stack.split("at ")[1].trim(),
          `Could not create section five`,
          500
        );
        return next(error);
      });
  } else {
    const files = req.files.image;

    let subDataTwo = [];

    if (files) {
      subDataTwo = files.map((file, i) => {
        return {
          languageCode: fileIndexes[i].split("-")[1],
          [fileIndexes[i].split("-")[0]]: file.path,
        };
      });
    }

    const isMain = subDataTwo.find((s) => s.languageCode === "en");

    let mainUpdates = {};

    if (isMain) {
      mainUpdates = { ...isMain };
    }

    try {
      await Master.findByIdAndUpdate(id, {
        $set: {
          ...mainUpdates,
        },
      });
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }
    
    const promises = [];

    for (let i = 0; i < subData.length; i++) {
      const lang = subData[i].languageCode;

      const isExist = subDataTwo.find((s) => s.languageCode === lang);

      let updates = {};

      if (isExist) {
        updates = { ...updates, ...isExist };
      }

      promises.push(
        MasterDescription.findByIdAndUpdate(subData[i].id, {
          $set: updates,
        })
      );
    }

    try {
      await Promise.all(promises);
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong",
        500
      );
      return next(error);
    }

    res.status(200).json({
      status: true,
      message: translateHelper(req, "Section  updated successfully"),
    });
  }
};

exports.getHomeSection5 = async (req, res, next) => {
  let sectionData;

  try {
    [sectionData] = await Master.aggregate([
      {
        $match: {
          key: "home-section-five",
        },
      },
      {
        $lookup: {
          from: "masterdescriptions",
          localField: "_id",
          foreignField: "mainPage",
          as: "langData",
        },
      },
      {
        $project: {
          imageOne: "$imageOne",
          imageTwo: "$imageTwo",
          imageThree: "$imageThree",
          langData: {
            _id: 1,
            languageCode: 1,
            image: 1,
          },
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      `Could not create about us`,
      500
    );
    return next(error);
  }
  res.status(200).json({
    status: true,
    message: translateHelper(req, "Section five fetched successfully"),
    sectionData,
  });
};

exports.postInventoryReason = async (req, res, next) => {
  const { reason, status } = req.body;

  let newMaster = new Master({
    key: "inventory-reason",
    reason,
    isActive: status,
    isDeleted: false,
  });

  try {
    await newMaster.save();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(201).json({
    status: true,
    message: translateHelper(req, "Inventory reason created successfully"),
  });
};

exports.getAllInventoryReasons = async (req, res, next) => {
  let reasons;

  try {
    reasons = await Master.find({
      key: "inventory-reason",
      isDeleted: false,
    });
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
    message: "Inventory reasons fetched successfully",
    reasons,
  });
};

exports.getInventoryReason = async (req, res, next) => {
  const { id } = req.params;

  let reason;

  try {
    reason = await Master.findOne({
      key: "inventory-reason",
      _id: ObjectId(id),
    });
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
    message: "Inventory reason fetched successfully",
    reason,
  });
};

exports.putInventoryReason = async (req, res, next) => {
  const { id, reason, status } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        reason,
        isActive: status,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Inventory reason updated successfully"),
  });
};

exports.deleteInventoryReason = async (req, res, next) => {
  const { id } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(req, "Inventory reason deleted successfully"),
    id,
  });
};

exports.updateInventoryReasonStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await Master.findByIdAndUpdate(id, {
      $set: {
        isActive: status,
      },
    });
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: translateHelper(
      req,
      "Inventory reason status updated successfully"
    ),
    id,
    newStatus: status,
  });
};
