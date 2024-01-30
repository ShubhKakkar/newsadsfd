const jwt = require("jsonwebtoken");

const generateToken = (id, isAdmin, role) => {
  return jwt.sign({ id, isAdmin, role }, process.env.JWT, {
    // expiresIn: isAdmin ? "60m" : "1y",
    expiresIn: "1y",
    issuer: "noonmar",
  });
};

module.exports = generateToken;
