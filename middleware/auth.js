const Campground = require("../models/campground");
const Comment = require("../models/comment");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
  },
  checkCampgroundOwnership: (req, res, next) => {
    // Is User logged in?
    if (req.isAuthenticated()) {
      Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
          req.flash("error", "Sorry, campground not found");
          res.redirect("back");
        } else {
          // Does User own the campground?
          if (
            foundCampground.author.id.equals(req.user._id) ||
            req.user.isAdmin
          ) {
            req.campground = foundCampground;
            next();
          } else {
            req.flash("error", "You don't have permission to do that");
            // If not, redirect back to the last page visited
            res.redirect("back");
          }
        }
      });
    } else {
      req.flash("error", "You need to be logged in to do that");
      // If not, redirect back to the last page visited
      res.redirect("back");
    }
  },

  checkCommentOwnership: (req, res, next) => {
    // Is User logged in?
    if (req.isAuthenticated()) {
      Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err || !foundComment) {
          req.flash("error", "Sorry, comment not found");
          res.redirect("back");
        } else {
          // Does User own the comment?
          if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
            req.comment = foundComment;
            next();
          } else {
            req.flash("error", "You don't have permission to do that");
            // If not, redirect back to the last page visited
            res.redirect("back" + req.params.id);
          }
        }
      });
    } else {
      req.flash("error", "You need to be logged in to do that");
      // If not, redirect back to the last page visited
      res.redirect("back");
    }
  },
  isAdmin: (req, res, next) => {
    if (req.user.isAdmin) {
      next();
    } else {
      req.flash(
        "error",
        "This site is now read only in order to prevent spams."
      );
      res.redirect("back");
    }
  },
};
