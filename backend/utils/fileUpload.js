const multer = require("multer");
const HttpError = require("../http-error");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "image/webp": "webp",
  "text/csv": "csv",
  "application/json": "json",
  "application/pdf": "pdf",
};

const fileUpload = (path) =>
  multer({
    limits: 500000,
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `uploads/images/${path}`);
      },
      filename: (req, file, cb) => {
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(
          null,
          new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
      },
    }),
    fileFilter: (req, file, cb) => {
      // const isValid = !!MIME_TYPE_MAP[file.mimetype];
      // let error = isValid ? null : new HttpError(req, "Invalid type", 500);
      // cb(error, isValid);
      cb(null, true);
    },
  });

module.exports = fileUpload;
