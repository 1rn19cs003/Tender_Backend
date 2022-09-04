
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const mongo = require("./src/config/database.config.js");
const multer = require("multer");

// Abhishek Jaiswal:- Let's check it out!!!!!!!
// mailto:-abhigrmr@gmail.com
// mailfrom:-abhicse003@gmail.com
// creating of express app
const app = express();


var cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  sessions({
    secret: "let's check it out !!!",
    saveUninitialized: true,
    cookie: {
      maxAge: oneDay,
    },
    resave: false,
  })
);
// enabling CROS

let origins = ["http://localhost:3000"]
if (process.env.NODE_ENV === "development") origins.push("http://localhost:3069", "http://localhost:3000")
app.use(function (req, res, next) {
    if (origins.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin) // restrict it to the required domain
    }
    // res.header("Access-Control-Allow-Origin", origins) // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET,POST")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

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
    if (err) throw err
    console.log(db)
    // Require routes
    require("./src/router/signin")(app, db)
    require("./src/router/routes")(app, db)
})


// server listening
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
