const mongoose = require("mongoose");

const DocumentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: false,
    },
    urlPath: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    noOfPages: {
      type: Number,
    },
    fileSize: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    author: {
      type: String,
    },
    metadata: {
      type: Object,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tag",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", DocumentSchema);
