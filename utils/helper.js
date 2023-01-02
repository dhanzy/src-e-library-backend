const multer = require("multer");
const exif = require("exiftool");
const fs = require("fs/promises");
const Document = require("../Model/DocumentModel");

const DOCUMENTDIR = "./public/documents";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DOCUMENTDIR);
  },
  filename: (req, file, cb) => {
    // cb(null, Date.now() + "." + file.originalname.split("."));
    cb(null, file.originalname);
  },
});

const uploadFile = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .pdf, .docx format are allowed"));
    }
  },
});

const addMetadata = async (path, title) => {
  const document = await Document.findOne({ title: title });
  if (document) {
    const data = fs.readFile(path, "binary");
    if (data) {
      console.log("Data Exist");
      exif.metadata(data, async function (err, metadata) {
        if (metadata) {
          document.metadata = metadata;
          document.save();
        }
      });
    }
  }
};

const Roles = {
  Student: 4096,
  Admin: 2048,
};

module.exports = { uploadFile, addMetadata, Roles };
