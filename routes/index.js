const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware/auth");

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "",
});

// GET - ROOT ROUTE
router.get("/", (req, res) => {
  res.render("landing");
});

// GET - Error 404 - Page Not Found
router.get("/404", (req, res) => {
  res.render("error/404");
});

// =============
//  AUTH ROUTES
// =============

// GET - REGISTER FORM ROUTE (Show register form)
router.get("/register", (req, res) => {
  res.render("register", { page: "register" });
});

// POST - Handle sign up logic
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
      return res.redirect("/register", { error: err.message });
    }
    passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome to VanPackers, " + user.username + "!");
      res.redirect("/checkout");
    });
  });
});

// GET - SHOW LOGIN FORM ROUTE
router.get("/login", (req, res) => {
  res.render("login", { page: "login" });
});

// POST - Handling login logic
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

// GET - LOGOUT ROUTE
router.get("/logout", (req, res) => {
  req.logout(); // This comes from the packages we've installed
  req.flash("success", "See you later!");
  res.redirect("/campgrounds");
});

// GET - CHECKOUT
router.get("/checkout", isLoggedIn, (req, res) => {
  if (req.user.isPaid) {
    req.flash("success", "Your account is already paid.");
    return res.redirect("/campgrounds");
  }
  res.render("checkout", { amount: 20 });
});

// POST - PAY ROUTE
router.post("/pay", isLoggedIn, async (req, res) => {
  const { paymentMethodId, items, currency } = req.body;

  const amount = 2000;

  try {
    // Create new PaymentIntent with a PaymentMethod ID from the client.
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      error_on_requires_action: true,
      confirm: true,
    });

    console.log("💰 Payment received!");

    req.user.isPaid = true;
    await req.user.save();
    // The payment is complete and the money has been moved
    // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

    // Send the client secret to the client to use in the demo
    res.send({ clientSecret: intent.client_secret });
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
    // See https://stripe.com/docs/declines/codes for more
    if (e.code === "authentication_required") {
      res.send({
        error:
          "This card requires authentication in order to proceeded. Please use a different card.",
      });
    } else {
      res.send({ error: e.message });
    }
  }
});

module.exports = router;
