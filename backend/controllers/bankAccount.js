const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../http-error");
const BankAccount = require("../models/bankAccount");

exports.create = async (req, res, next) => {
  const { name, bankId, information, currency, iban } = req.body;
  // const regex = new RegExp("^[DE]{2}([0-9a-zA-Z]{20})$");

  // if (!regex.test(iban)) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Ibank number wrong",
  //     500
  //   );
  //   return next(error);
  // }

  const newBankAccount = new BankAccount({
    name,
    bankId: ObjectId(bankId),
    information,
    currency: ObjectId(currency),
    iban,
  });

  try {
    await newBankAccount.save();
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
    message: "Bank Account Created Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let { id } = req.params;
  let { page, per_page, sortBy, order, name, isActive, dateFrom, dateTo } =
    req.query;

  if (!page) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Page Query is required.",
      422
    );
    return next(error);
  }

  name = name ?? "";

  per_page = +per_page ?? 10;

  let bankAccounts, totalDocuments;

  let findData = {};

  if (isActive && isActive.length > 0) {
    findData.isActive = "true" == isActive;
  }
  if (dateFrom && dateTo) {
    findData.createdAt = {
      $gte: new Date(dateFrom),
      $lt: new Date(dateTo),
    };
  }

  try {
    if (page == 1) {
      totalDocuments = await BankAccount.find({
        name: { $regex: name, $options: "i" },
        bankId: ObjectId(id),
        isDeleted: false,
        ...findData,
      })
        .lean()
        .select({ _id: 1 })
        .countDocuments();

      bankAccounts = await BankAccount.find({
        name: { $regex: name, $options: "i" },
        bankId: ObjectId(id),
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .limit(per_page)
        .lean();
    } else {
      bankAccounts = await BankAccount.find({
        name: { $regex: name, $options: "i" },
        bankId: ObjectId(id),
        isDeleted: false,
        ...findData,
      })
        .sort({ [sortBy]: order == "asc" ? 1 : -1 })
        .skip((page - 1) * per_page)
        .limit(per_page)
        .lean();
    }
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch bank accounts.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Bank account's Fetched successfully.",
    bankAccounts,
    totalDocuments,
  });
};

exports.update = async (req, res, next) => {
  let { name, bankId, information, currency, iban, id } = req.body;
  // const regex = new RegExp("^[DE]{2}([0-9a-zA-Z]{20})$");

  // if (!regex.test(iban)) {
  //   const error = new HttpError(
  //     req,
  //     new Error().stack.split("at ")[1].trim(),
  //     "Ibank number wrong",
  //     500
  //   );
  //   return next(error);
  // }

  try {
    await BankAccount.findByIdAndUpdate(id, {
      name,
      bankId: ObjectId(bankId),
      currency: ObjectId(currency),
      information,
      iban,
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
    message: "Bank account's updated successfully",
  });
};

exports.getOne = async (req, res, next) => {
  const { id, bankId } = req.params;

  let bankAccount;

  try {
    [bankAccount] = await BankAccount.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          bankId: new ObjectId(bankId),
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      {
        $unwind: {
          path: "$currency",
        },
      },
      {
        $project: {
          currency: {
            label: "$currency.sign",
            value: "$currency._id",
          },
          name: 1,
          bankId: 1,
          information: 1,
          iban: 1,
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
    message: "Bank account's fetched successfully",
    bankAccount,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await BankAccount.findByIdAndUpdate(id, {
      isActive: status,
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
    message: "Account's status changed successfully.",
    id,
    status,
  });
};

exports.delete = async (req, res, next) => {
  const { id } = req.body;

  try {
    await BankAccount.findByIdAndUpdate(id, {
      isDeleted: true,
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
    message: "Account's deleted Successfully",
    id,
  });
};
