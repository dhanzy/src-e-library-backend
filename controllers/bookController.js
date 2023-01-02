const fs = require("fs");
const path = require("path");
// const { PDFNet } = require("@pdftron/pdfnet-node");
const { fromPath } = require("pdf2pic");

// const { addMetadata } = require("../utils/helper");
const Document = require("../Model/DocumentModel");
const Tag = require("../Model/TagsModel");
const { User } = require("../Model/userModel");

const uploadBook = async (req, res) => {
  try {
    const documentSent = req.file;
    const postedUser = req.user;
    const { title, author, pageCount, bookDesc, tags } = req.body;
    const newTitle = !title ? documentSent.originalname : title;
    const listTags = tags.split(",");
    const addedTags = [];

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
    // let document = await Document.findOne({ title: newTitle });
    // if (document) {
    //   return res.status(401).json({ error: "Document already exist!" });
    // }

    const inputPath = path.resolve(__dirname, `../${documentSent.path}`);
    const stats = fs.statSync(inputPath);
    document = await Document.create({
      title: newTitle,
      author: author,
      urlPath: documentSent.path,
      noOfPages: pageCount,
      description: bookDesc,
      tags: addedTags,
      user: postedUser,
      fileSize: `${Number(stats.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    // addMetadata(documentSent.path, newTitle);
    res.status(200).json(document);
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ error: "An error occured" });
  }
};

const getDocument = async (req, res) => {
  try {
    const qnew = req.query.new;
    let documents;
    if (qnew) {
      documents = await Document.find().sort({ createdAt: -1 }).limit(6);
    } else {
      documents = await Document.find().sort({ createdAt: -1 });
    }
    res.status(200).json(documents);
  } catch (err) {
    console.log(err);
    res.status(401).json("Error occured");
  }
};

const getDocumentById = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId).populate({
      path: "tags",
      model: "Tag",
      select: "title",
    });
    if (document) {
      res.status(200).json(document);
    } else {
      res.status(404).json({ error: "Document does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "An Error Occured" });
  }
};

const deleteDocumentById = async (req, res) => {
  try {
    const product = await Document.findByIdAndDelete(req.params.documentId);
    if (!product) {
      return res.status(400).json({ error: "Product does not exist" });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Unable to delete product" });
  }
};

const updateDocumentById = async (req, res) => {
  try {
    const { author, tags, bookDesc } = req.body;
    if (!author || !bookDesc) {
      return res.status(400).json({ error: "Please fill in the fields" });
    }
    const addedTags = [];
    for (const listTag of tags) {
      let tag = await Tag.findOne({
        title: { $regex: listTag.toLowerCase(), $options: "i" },
      });
      if (!tag) {
        tag = await Tag.create({ title: listTag });
      }
      addedTags.push(tag);
    }
    const product = await Document.findByIdAndUpdate(
      req.params.documentId,
      {
        $set: {
          description: bookDesc,
          author: author,
          tags: addedTags,
        },
      },
      { new: true }
    );
    if (!product) {
      return res.status(400).json({ error: "Product does not exist" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Unable to delete product" });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId);
    if (!document) {
      res.sendStatus(500);
    }
    const inputPath = path.resolve(__dirname, `../${document.urlPath}`);
    document.downloads += 1;
    document.save();
    res.download(inputPath);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
};

const searchDocument = async (req, res) => {
  try {
    const documentSearch = req.params.documentSearch;
    const listDocuments = await Document.find({
      title: { $regex: new RegExp(documentSearch.toLowerCase(), "i") },
    }).limit(5);
    res.status(200).json(listDocuments);
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "An error occured" });
  }
};

const generateThumbnail = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await Document.findById(documentId).lean();
    if (!document) {
      res.sendStatus(500);
    }
    const outputPath = path.resolve(__dirname, "../public/thumbnails");
    const inputPath = path.resolve(__dirname, `../${document.urlPath}`);
    const outputFile = `${outputPath}/${document.urlPath}.png`;
    // const getThumbFromDocument = async () => {
    //   const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath);
    //   await doc.initSecurityHandler();
    //   const pdfDraw = await PDFNet.PDFDraw.create(92);
    //   const currPage = await doc.getPage(1);
    //   await pdfDraw.export(currPage, outputPath, "PNG");
    // };

    // PDFNet.runWithCleanup(getThumbFromDocument)
    //   .then(() => {
    //     fs.readFile(outputPath, (err, data) => {
    //       if (err) {
    //         res.statusCode = 500;
    //         res.end(err);
    //       } else {
    //         res.setHeader("ContentType", "application/png");
    //         res.end(data);
    //       }
    //     });
    //   })
    //   .catch((err) => {
    //     res.statusCode = 500;
    //     res.end(err);
    //   });
    const options = {
      density: 100,
      saveFilename: `${document._id}`,
      savePath: outputPath,
      format: "png",
      width: 600,
      height: 600,
    };
    const storeAsImage = fromPath(inputPath, options);
    const pageToConvertAsImage = 1;
    await storeAsImage(pageToConvertAsImage).then((resolve) => {
      return resolve;
    });
    fs.readFile(`${outputPath}/${document._id}.1.png`, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(err);
      } else {
        res.setHeader("ContentType", "application/png");
        res.end(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "An error occured" });
  }
};

const generatePreview = async (req, res) => {
  try {
    const outputPath = path.resolve(__dirname, "../public/thumbnails");
    const inputPath = path.resolve(__dirname, `../${document.urlPath}`);
  } catch (err) {}
};

const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().lean().select("title");
    res.status(200).json(tags);
  } catch (err) {
    console.log(err);
    json.sendStatus(401);
  }
};

function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    bytes = bytes + " bytes";
  } else if (bytes == 1) {
    bytes = bytes + " byte";
  } else {
    bytes = "0 bytes";
  }
  return bytes;
}

const addToFavorite = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: "Book Id is required" });
    }
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Book does not exist!" });
    }
    const userId = req.user;
    const user = await (
      await User.findById(userId._id)
    ).populate({ path: "favoriteBooks", model: "Document" });
    const oldFavorite = user.favoriteBooks;
    const bookExist = oldFavorite.find((item) => item._id.equals(document._id));
    if (!bookExist) {
      user.favoriteBooks.push(document);
    } else {
      const remainBooks = oldFavorite.filter(
        (item) => !item._id.equals(document._id)
      );
      user.favoriteBooks = remainBooks;
      user.save();
      return res.status(200).json(remainBooks);
    }
    user.save();
    res.status(200).json(user.favoriteBooks);
  } catch (err) {
    console.log(err.message);
    res.status(400).json(err.message);
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId._id).populate({
      path: "favoriteBooks",
      model: "Document",
    });
    res.status(200).json(user.favoriteBooks);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};

const getMyBooks = async (req, res) => {
  try {
    const user = req.user;

    let mybooks = await Document.find().populate({
      path: "tags",
      model: "Tag",
      match: {
        $or: [
          {
            title: {
              $eq: user.department,
            },
          },
          {
            title: {
              $eq: user.college,
            },
          },
          {
            title: {
              $eq: user.level,
            },
          },
          {
            title: {
              $eq: `${user.level} Level`,
            },
          },
        ],
      },
    });

    mybooks = mybooks.filter(function (book) {
      return book.tags.length;
    });

    res.status(200).json(mybooks);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  uploadBook,
  getDocument,
  searchDocument,
  generateThumbnail,
  downloadDocument,
  getDocumentById,
  getAllTags,
  deleteDocumentById,
  updateDocumentById,
  addToFavorite,
  getFavorites,
  getMyBooks,
};
