const router = require("express").Router();
const multer = require("multer");
const {
  cloudinaryUpload,
  generateThumbnail,
} = require("../utils/cloudinaryUpload");

const {
  uploadBook,
  downloadBook,
  getDocument,
  searchDocument,
  downloadDocument,
  // generateThumbnail,
  getDocumentById,
  deleteDocumentById,
  updateDocumentById,
  getAllTags,
  addToFavorite,
  getFavorites,
  getMyBooks,
} = require("../controllers/bookController");
// const { uploadFile } = require("../utils/helper");
const { protect, adminProtect } = require("../middleware/authMiddleware");

const uploadFile = multer();

router.get("/document", getDocument);
router.post("/document/favorite", protect, addToFavorite);
router.get("/document/favorite", protect, getFavorites);
router.get("/document/mybooks", protect, getMyBooks);
router.get("/tags", protect, adminProtect, getAllTags);
// router.post(
//   "/upload",
//   protect,ch
//   adminProtect,
//   uploadFile.single("document"),
//   uploadBook
// );

router.post(
  "/upload",
  protect,
  adminProtect,
  uploadFile.single("document"),
  cloudinaryUpload
);
router.get("/document/:documentId", getDocumentById);
router.put("/document/:documentId", protect, adminProtect, updateDocumentById);
router.delete(
  "/document/:documentId",
  protect,
  adminProtect,
  deleteDocumentById
);
router.get("/document/search/:documentSearch", searchDocument);
router.get("/document/thumbnail/:documentId", generateThumbnail);
router.get("/document/download/:documentId", downloadDocument);

module.exports = router;
