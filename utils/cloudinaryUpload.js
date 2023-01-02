const cloudinary = require("cloudinary");
const streamifier = require("streamifier");
const Tag = require("../Model/TagsModel");
const Document = require("../Model/DocumentModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadFile = (file) => {
  cloudinary.v2.uploader.upload(file).then((res) => {
    console.log(res);
  });
};

// cloudinary.v2.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

async function cloudinaryUpload(req, res) {
  try {
    const { title, author, pageCount, bookDesc, tags } = req.body;
    const newTitle = !title ? documentSent.originalname : title;
    const listTags = tags.split(",");
    const addedTags = [];
    const postedUser = req.user;

    if (!author || !bookDesc || !pageCount) {
      return res.status(400).json({ error: "Please fill in the fields" });
    }

    for (const listTag of listTags) {
      let tag = await Tag.findOne({
        title: { $regex: listTag.toLowerCase(), $options: "i" },
      });
      if (!tag) {
        tag = await Tag.create({ title: listTag });
      }
      addedTags.push(tag);
    }

    let streamUpload = (req) => {
      try {
        console.log("StreamUpload");
        return new Promise((resolve, reject) => {
          let stream = cloudinary.v2.uploader.upload_stream(
            { folder: "ELibrary" },
            (error, result) => {
              if (result) {
                console.log("Gotten Result");
                resolve(result);
              } else {
                console.log(error);
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      } catch (error) {
        console.log(error);
        return res.status({ error: error.message });
      }
    };

    async function upload(req) {
      console.log("Uploading");
      let result = await streamUpload(req);
      console.log(result);

      document = await Document.create({
        title: newTitle,
        author: author,
        urlPath: result.secure_url,
        noOfPages: pageCount,
        description: bookDesc,
        tags: addedTags,
        user: postedUser,
        fileSize: `${Number(result.bytes / (1024 * 1024)).toFixed(2)} MB`,
      });

      res.status(200).json("Uploaded Successfully");
    }

    await upload(req);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "An error occured" });
  }
}

const generateThumbnail = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId).lean();
    if (!document) {
      res.sendStatus(500);
    }
    // const imageSrc = document.urlPath
    const imageSrc =
      "https://res.cloudinary.com/doy9mlazg/image/upload/v1664358890/ELibrary/tubqkn9hzbrwikvrbobq.png";
    const imagePath = cloudinary.image(
      `${imageSrc.substr(0, imageSrc.lastIndexOf("."))}.png`,
      {
        transformation: [{ width: 600, crop: "scale" }, { page: 1 }],
      }
    );
    console.log(imagePath.split("'")[1]);
    res.status(200).json(imagePath.split("'")[1]);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { cloudinaryUpload, generateThumbnail };
