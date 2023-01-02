const mongoose = require("mongoose");

const TagSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      set: capitalizeFirstLetter,
    },
  },
  { timestamps: true }
);

function capitalizeFirstLetter(v) {
  return v.charAt(0).toUpperCase() + v.substring(1).toLowerCase();
}

module.exports = mongoose.model("Tag", TagSchema);
