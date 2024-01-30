const hmacS256 = require("crypto-js/hmac-sha256");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const HttpError = require("../http-error");
const Transaction = require("../models/transaction");

module.exports = async (req, res, next) => {
  const { orderId, razorpay_payment_id, razorpay_signature, paymentIntentId } =
    req.body;

  if (paymentIntentId) {
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (err) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Something went wrong while verifying payment.",
        422
      );
      return next(error);
    }

    if (paymentIntent.status !== "succeeded") {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Payment Failed. Please try again.",
        422
      );
      return next(error);
    }

    let transaction;

    try {
      transaction = await Transaction.findOne({
        stripePaymentIntentId: paymentIntent.id,
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

    if (transaction) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Payment Failed. Please try again..",
        422
      );
      return next(error);
    }
  } else {
    const generated_signature = hmacS256(
      orderId + "|" + razorpay_payment_id,
      process.env.RAZORPAY_SECRET_KEY
    ).toString();

    if (razorpay_signature != generated_signature) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Payment Failed. Please try again.",
        422
      );
      return next(error);
    }

    let transaction;

    try {
      transaction = await Transaction.findOne({
        razorpayPaymentId: razorpay_payment_id,
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

    if (transaction) {
      const error = new HttpError(
        req,
        new Error().stack.split("at ")[1].trim(),
        "Payment Failed. Please try again..",
        422
      );
      return next(error);
    }
  }

  next();
};
