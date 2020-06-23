const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Campground = require("../models/campground");
const middleware = require("../middleware/auth");
const { isLoggedIn } = middleware;

// USER PROFILE
router.get("/users/:id", isLoggedIn, (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err || !foundUser) {
      // req.flash("error", "Sorry, user not found.");
      return res.redirect("/404");
    }
    Campground.find()
      .where("author.id")
      .equals(foundUser._id)
      .exec((err, campgrounds) => {
        if (err) {
          // req.flash("error", "Sorry, campground not found.");
          return res.redirect("/404");
        }
        res.render("users/show", { user: foundUser, campgrounds: campgrounds });
      });
  });
});

module.exports = router;
