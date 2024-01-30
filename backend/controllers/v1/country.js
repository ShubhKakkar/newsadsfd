const axios = require("axios");
const ObjectId = require("mongoose").Types.ObjectId;

const { translateHelper, parseIp } = require("../../utils/helper");
const Country = require("../../models/country");
const HttpError = require("../../http-error");

exports.getAll = async (req, res, next) => {
  let countries;
  try {
    countries = await Country.find({
      isActive: true,
      isDeleted: false,
      currency: {
        $exists: true,
      },
    })
      .select("name countryCode")
      .sort({ name: 1 })
      .lean();
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching countries.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    status: true,
    message: "Countries has been fetched successfully.",
    data: countries,
  });
};

exports.getCurrentCountry = async (req, res, next) => {
  const ipaddress = parseIp(req);
  // const ipaddress = "122.160.196.14";
  // console.log("ipaddress", ipaddress);

  const defaultCountry = {
    id: process.env.COUNTRY_ID,
    name: process.env.COUNTRY_NAME,
  };

  let ipData;
  try {
    ipData = await axios.get(
      `https://api.ipregistry.co/${ipaddress}?key=bbezo6asr2y3gh18`
    );
  } catch (err) {
    // console.log("err", err.response.data);
    //err.response.data
    // {
    //   "code": "INVALID_IP_ADDRESS",
    //   "message": "You entered a value that does not appear to be a valid IP address.",
    //   "resolution": "Enter a valid IPv4 or IPv6 address."
    //   }
    return res.status(200).json({ country: defaultCountry });
  }

  const countryName = ipData.data.location.country.name;

  let country;

  try {
    [country] = await Country.aggregate([
      {
        $match: {
          isActive: true,
          isDeleted: false,
          name: new RegExp(countryName, "gi"),
        },
      },
      {
        $project: {
          id: "$_id",
          _id: 0,
          name: 1,
        },
      },
    ]);
  } catch (err) {
    const error = new HttpError(
      req,
      new Error().stack.split("at ")[1].trim(),
      "Something went wrong while fetching countries.",
      500
    );
    return next(error);
  }

  return res.status(200).json({ country: country ? country : defaultCountry });
};
