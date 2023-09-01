const express = require("express");
const path = require("path"); // built in middleware
const app = express();
const loggerMorgan = require("morgan"); // third party middleware
const router = express.Router(); // built in middleware
const multer = require("multer"); // third party middleware
const upload = multer({ dest: "./public/uploads" }); //third party middleware

const port = 3001;
//Built in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

//Application level middleware
const logger = (req, res, next) => {
  console.log(`${new Date()} -- Request [${req.method}] [${req.url}]`);
  next();
};
app.use(logger);

//Third party middleware
app.use(loggerMorgan("combined"));

//Router level middleware
app.use("/api/users", router);

const fakeAuth = (req, res, next) => {
  const authStatus = true;
  if (authStatus) {
    console.log("User authStatus : ", authStatus);
    next();
  } else {
    res.status(401);
    throw new Error("User is not authorized");
  }
};

const getUsers = (req, res) => {
  res.json({ message: "Get all users" });
};
const createUser = (req, res) => {
  console.log("This is the request body received from client : ", req.body);
  res.json({ message: "Create new user" });
};
router.use(fakeAuth);
router.route("/").get(getUsers).post(createUser);

//Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  switch (statusCode) {
    case 401:
      res.json({
        title: "Unauthorized",
        message: err.message,
      });
    case 404:
      res.json({
        title: "Not found",
        message: err.message,
      });
    case 500:
      res.json({
        title: "Internal Server error",
        message: err.message,
      });
    default:
      break;
  }
};
app.post(
  "/upload",
  upload.single("image"),
  (req, res, next) => {
    console.log(req.file, req.body);
    res.send(req.file);
  },
  (err, req, res, next) => {
    res.status(400).send({ err: err.message });
  }
);

app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route not found");
});
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server started on port 3001");
});
