const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // "ref" is the model that we are refering to with "ObjectId"
    },
    username: String,
    avatar: String,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
