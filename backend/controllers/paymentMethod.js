const ObjectId = require("mongoose").Types.ObjectId;

const HttpError = require("../http-error");
const PaymentMethod = require("../models/paymentMethod");

exports.create = async (req, res, next) => {
  const { name, isOnlinePayment } = req.body;

  //   const data = members.map((item) => ObjectId(item));
  // if(isOnlinePayment){
  //     isOnlinePayment = isOnlinePayment?isOnlinePayment:true
  // }

  const newPaymentMethod = new PaymentMethod({
    name,
    isOnlinePayment,
  });

  try {
    await newPaymentMethod.save();
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
  res.status(201).json({
    status: true,
    message: "Payment Method Created Successfully",
  });
};

exports.update = async (req, res, next) => {
  const {
    id,
    isOnlinePayment,
    percentage,
    fixedValue,
    minimumLimit,
    information,
  } = req.body;

  //   const data = members.map((item) => ObjectId(item));
  // if(isOnlinePayment){
  //     isOnlinePayment = isOnlinePayment?isOnlinePayment:true
  // }

  try {
    await PaymentMethod.findByIdAndUpdate(id, {
      isOnlinePayment,
      percentage,
      fixedValue,
      minimumLimit,
      information,
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
  res.status(201).json({
    status: true,
    message: "Payment Method Updated Successfully",
  });
};

exports.getAll = async (req, res, next) => {
  let paymentMethod;

  try {
    paymentMethod = await PaymentMethod.find();
  } catch (err) {
    console.log(err, "err");
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Could not fetch payment method.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Payment method`s Fetched successfully.",
    paymentMethod,
  });
};

//   const { id, group } = req.params;
//   let data;
//   try {
//     data = await Group.findOne(
//       {
//         isActive: true,
//         isDeleted: false,
//         type: group,
//         _id: ObjectId(id),
//       },
//       {
//         _id: 1,
//         name: 1,
//         members: 1,
//       }
//     );
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Group fetched successfully",
//     data,
//   });
// };

// exports.update = async (req, res, next) => {
//   let { group } = req.params;
//   let { members, id, name } = req.body;

//   try {
//     await Group.findByIdAndUpdate(id, { members, name, type: group });
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong",
//       500
//     );
//     return next(error);
//   }
//   res.status(200).json({
//     status: true,
//     message: "Group's updated successfully",
//   });
// };
// exports.delete = async (req, res, next) => {
//   const { id } = req.body;

//   try {
//     await Group.findByIdAndUpdate(id, {
//       isDeleted: true,
//     });
//   } catch (err) {
//     const error = new HttpError(
//       req,
//       new Error().stack.split("at ")[1].trim(),
//       "Something went wrong",
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({
//     status: true,
//     message: "Group deleted Successfully",
//     id,
//   });
// };

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  let paymentMethod;

  try {
    paymentMethod = await PaymentMethod.findOne({
      _id: ObjectId(id),
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
    message: "Payment Methods fetched successfully",
    paymentMethod,
  });
};

exports.changeStatus = async (req, res, next) => {
  const { id, status } = req.body;

  try {
    await PaymentMethod.findByIdAndUpdate(id, {
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
    message: "Group's status changed successfully.",
    id,
    status,
  });
};
