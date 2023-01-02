const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    roles: {
      type: [Number],
      default: 4096,
    },
    favoriteBooks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Document",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
