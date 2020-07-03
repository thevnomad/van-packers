require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const User = require("./models/user");
const methodOverride = require("method-override");
// const seedDB = require("./seeds");

// Requiring routes
const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");
const userRoutes = require("./routes/users");

const app = express();

// Init
mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log("MongoDB is running!");
  }
);

// mongoose.connect(
//   process.env.DATABASE_URL,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   () => {
//     console.log("Database connected!");
//   }
// );

// Settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// To get the whole PATH
// console.log(__dirname)
app.use(express.json());

// Enabling CORS for all requests
app.use(cors());
// Adding morgan to log HTTP requests
app.use(morgan("combined"));
app.use(helmet());
// Using bodyParser to parse JSON bodies into JS objects
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
// Require moment
app.locals.moment = require("moment");
// seedDB(); - Seed the database

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    // Our unique secret key -- this keeps sessions secure -- it should
    // never be checked into version control, but it should be the same
    // among all servers
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// "authenticate" comes from "passportLocalMongoose"
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// User in sessions
// Passing "currentUser" to every template.
// This function will be called in every route
app.use((req, res, next) => {
  // "req.user" will be empty or it will contain the useranme and the ID of the "current user"
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Routes
// Append "/"
app.use("/", indexRoutes);
// Append "/campgrounds"
app.use("/campgrounds", campgroundRoutes);
// Here, we pass an object {mergeParams: true}, inside "comments" route, to solve ":id" = null
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(userRoutes);

// Error Handling
app.use((err, req, res, next) => {
  res.status(500).send("Something broke. Please try again.");
  console.log("ERROR: " + err.message);
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log("The VanPackers Server Has Started!");
});
