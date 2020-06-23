const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware/auth");
const { isLoggedIn, checkCampgroundOwnership } = middleware; // Destructuring assignment

// INDEX ROUTE - Show all campgrounds
router.get("/", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err.message);
    } else {
      if (req.xhr) {
        res.json(allCampgrounds);
      } else {
        res.render("campgrounds/index", {
          campgrounds: allCampgrounds,
          page: "campgrounds",
        });
      }
    }
  });
});

// CREATE ROUTE - Add new campground to DB
router.post("/", isLoggedIn, (req, res) => {
  // Get data from form and add to campgrounds array
  const name = req.body.name;
  const image = req.body.image;
  const price = req.body.price;
  const desc = req.body.description;
  const location = req.body.location;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };
  const newCampground = {
    name: name,
    image: image,
    price: price,
    description: desc,
    location: location,
    author: author,
  };
  // Create a new campground and save it to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err.message);
    } else {
      // Redirect back to "Campgrounds Page"
      console.log(newlyCreated);
      res.redirect("/campgrounds");
    }
  });
});

// NEW ROUTE - Show form to create new campground
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// SHOW ROUTE - Shows more info about one campground
router.get("/:id", (req, res) => {
  // Find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        // req.flash("error", "Sorry, campground not found!");
        return res.redirect("/404");
        // console.log(err.message);
      }
      console.log(foundCampground);
      // Render show template with that campground
      res.render("campgrounds/show", { campground: foundCampground });
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", isLoggedIn, checkCampgroundOwnership, (req, res) => {
  res.render("campgrounds/edit", {
    campground: req.campground,
  });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", isLoggedIn, checkCampgroundOwnership, (req, res) => {
  const newData = {
    name: req.body.name,
    image: req.body.image,
    price: req.body.price,
    description: req.body.description,
    location: req.body.location,
  };
  // Find and Update the correct campground
  Campground.findByIdAndUpdate(
    req.params.id,
    {
      $set: newData,
    },
    (err, campground) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Campground successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    }
  );
});

// DESTROY - Removes campground and its comments from DB
router.delete("/:id", isLoggedIn, checkCampgroundOwnership, (req, res) => {
  Comment.remove(
    {
      _id: {
        $in: req.campground.comments,
      },
    },
    (err) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        req.campground.remove(function (err) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("/");
          }
          req.flash("error", "Campground successfully deleted!");
          res.redirect("/campgrounds");
        });
      }
    }
  );
});

module.exports = router;
