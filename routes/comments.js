const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware/auth");
let { isLoggedIn, checkCommentOwnership, isAdmin, isPaid } = middleware;
router.use(isLoggedIn, isPaid);

// Comments New
router.get("/new", (req, res) => {
  // Find Campground by ID
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
    } else {
      // Render to "new"
      res.render("comments/new", { campground: campground });
    }
  });
});

// Comments Create
router.post("/", (req, res) => {
  // Lookup campground using ID
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err.message);
      res.redirect("/campgrounds");
    } else {
      // Create new comment
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          req.flash("error", "Something went wront");
          console.log(err.message);
        } else {
          // Add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.author.avatar = req.user.avatar;
          // Save comment
          comment.save();
          // Asociating the comment to the campground
          // Connect new comment to campground
          campground.comments.push(comment); // "comment" comes from the DB
          campground.save();
          console.log(comment);
          // Redirect back to "campground" show page
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      // req.flash("error", "Sorry, campground not found!");
      return res.redirect("/404");
    }
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          campground_id: req.params.id,
          comment: foundComment,
        });
      }
    });
  });
});

// COMMENT UPDATE
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err) => {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", checkCommentOwnership, isAdmin, (req, res) => {
  // Find campground, remove comment from comments array, delete comment in DB
  Campground.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        comments: req.comment.id,
      },
    },
    (err) => {
      if (err) {
        console.log(err.message);
        req.flash("error", err.message);
        res.redirect("/");
      } else if (isAdmin) {
        req.comment.remove((err) => {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          req.flash("error", "Comment succesfully deleted!");
          res.redirect("/campgrounds/" + req.params.id);
        });
      }
    }
  );
});

module.exports = router;
