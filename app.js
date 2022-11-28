const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const mongo = require("./src/config/database.config.js");
const multer = require("multer");
const path = require("path");
// const MongoStore= require("connect-mongo");
const MongoStore = require("connect-mongo");

// Abhishek Jaiswal:- Let's check it out!!!!!!!
// mailto:-abhigrmr@gmail.com
// mailfrom:-abhicse003@gmail.com
// creating of express app
const app = express();

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  sessions({
    secret: "let's check it out !!!",
    saveUninitialized: false,
    // cookie: {
    //   maxAge: oneDay,
    // },
    resave: false,
  })
);

// app.use(
//   sessions({
//     secret: process.env.COOKIE_SECRET,
//     sameSite: true,
//     path: "/",
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/",
//       dbName: "Vendors",
//       ttl: 14 * 24 * 60 * 60, // 14 Days
//       touchAfter: 600, // writes to db every 10 minutes
//       crypto: {
//         secret: process.env.SESSION_KEY,
//       },
//     }),
//     saveUninitialized: false, // don't create session until something stored
//     resave: false, //don't save session if unmodified
//   })
// )
// enabling CROS

let origins = ["http://localhost:3000"];
if (process.env.NODE_ENV === "development")
  origins.push("http://localhost:3000");
app.use(function (req, res, next) {
  if (origins.includes(req.headers.origin)) {
    res.header("Access-Control-Allow-Origin", req.headers.origin); // restrict it to the required domain
  }
  // res.header("Access-Control-Allow-Origin", origins) // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// use body parser to decode query params and json body.
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // cookie parser middleware

// port set-up
const port = process.env.PORT || 6969; // Unique port not to conflict...

// Init database connection
mongo.connect((err, db) => {
  if (err) throw err;
  console.log(db);
  // Require routes
  require("./src/router/signin")(app, db);
  require("./src/router/routes")(app, db);
});

app.get("/uploads/:filename", (req, res) => {
  console.log(res.params);
  res.sendFile(path.join(__dirname + "/uploads/" + req.params.filename));
});

app.get("/uploads_tender/:filename", (req, res) => {
  console.log(res.params);
  res.sendFile(path.join(__dirname + "/uploads_tender/" + req.params.filename));
});

// server listening
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});



