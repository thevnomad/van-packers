const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Campground = require("../models/campground");
const middleware = require("../middleware/auth");
const { isLoggedIn } = middleware;

// ROOT ROUTE
router.get("/", (req, res) => {
  res.render("landing");
});

router.get("/404", (req, res) => {
  res.render("error/404");
});

// =============
//  AUTH ROUTES
// =============

// REGISTER FORM ROUTE (Show register form)
router.get("/register", (req, res) => {
  res.render("register", { page: "register" });
});

// Handle sign up logic
router.post("/register", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar,
  });
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      // If the password is empty, the username is empty or the username is already taken
      req.flash("error", err.message);
      return res.render("register", { error: err.message });
    }
    passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome to VanPackers, " + user.username + "!");
      res.redirect("/campgrounds");
    });
  });
});

// SHOW LOGIN FORM ROUTE
router.get("/login", (req, res) => {
  res.render("login", { page: "login" });
});

// Handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back!",
  }),
  (req, res) => {}
);

// LOGOUT ROUTE
router.get("/logout", (req, res) => {
  req.logout(); // This comes from the packages we've installed
  req.flash("success", "See you later!");
  res.redirect("/campgrounds");
});

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
