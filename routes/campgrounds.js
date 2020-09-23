const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware/auth");
var multer = require("multer");
let { isLoggedIn, checkCampgroundOwnership, isPaid } = middleware; // Destructuring assignment
// router.use(isLoggedIn);

// Multer config
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

// Cloudinary config
var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "devnomad",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define escapeRegex function for search feature
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// GET - INDEX ROUTE - Show all campgrounds
router.get("/", (req, res) => {
  if (req.query.paid) {
    res.locals.success =
      "Payment succeeded, thanks for contributing to VanPackers!";
  }

  if (req.query.search && req.xhr) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all campgrounds from DB
    Campground.find({ name: regex }, (err, allCampgrounds) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json(allCampgrounds);
      }
    });
  } else {
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
  }
});

// POST - CREATE ROUTE - Add new campground to DB
router.post("/", isLoggedIn, isPaid, upload.single("image"), (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // Add Cloudinary URL for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    // Add image's public_id to campground object
    req.body.campground.imageId = result.public_id;
    // Get data from form and add to campgrounds array
    const name = req.body.campground.name;
    const price = req.body.campground.price;
    const desc = req.body.campground.description;
    const location = req.body.campground.location;
    const author = {
      id: req.user._id,
      username: req.user.username,
    };
    const newCampground = {
      name: name,
      image: req.body.campground.image,
      imageId: req.body.campground.imageId,
      price: price,
      description: desc,
      location: location,
      author: author,
    };
    // Create a new campground and save it to DB
    Campground.create(newCampground, (err, newlyCreated) => {
      if (err) {
        req.flash("error", err.message);
        console.log(err.message);
        res.redirect("back");
      } else {
        // Redirect back to "Campground's Page"
        console.log(newlyCreated);
        res.redirect("/campgrounds/" + newlyCreated.id);
      }
    });
  });
});

// GET - NEW ROUTE - Show form to create new campground
router.get("/new", isLoggedIn, isPaid, (req, res) => {
  res.render("campgrounds/new");
});

// GET - SHOW ROUTE - Shows more info about one campground
router.get("/:id", isLoggedIn, isPaid, (req, res) => {
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

// GET - EDIT CAMPGROUND ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isPaid,
  checkCampgroundOwnership,
  (req, res) => {
    res.render("campgrounds/edit", {
      campground: req.campground,
    });
  }
);

// PUT - UPDATE CAMPGROUND ROUTE
router.put(
  "/:id",
  isLoggedIn,
  isPaid,
  checkCampgroundOwnership,
  upload.single("image"),
  (req, res) => {
    // Find and Update the correct campground
    Campground.findById(req.params.id, async (err, campground) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            campground.imageId = result.public_id;
            campground.image = result.secure_url;
          } catch (error) {
            req.flash("error", err.message);
            res.redirect("back");
          }
        }
        (campground.name = req.body.name),
          (campground.price = req.body.price),
          (campground.description = req.body.description),
          (campground.location = req.body.location),
          campground.save();
        req.flash("success", "Campground successfully updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  }
);

// DELETE - Removes campground and its comments from DB
router.delete(
  "/:id",
  isLoggedIn,
  isPaid,
  checkCampgroundOwnership,
  (req, res) => {
    Campground.findById(req.params.id, async (err, campground) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        Comment.remove({
          _id: {
            $in: req.campground.comments,
          },
        });
        campground.remove();
        req.flash("error", "Campground successfully deleted!");
        res.redirect("/campgrounds");
      } catch (error) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    });
  }
);

module.exports = router;
