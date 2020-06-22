const mongoose = require("mongoose");

// Schema SETUP
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId, // Associating the comments to the campgrounds
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Campground", campgroundSchema);
