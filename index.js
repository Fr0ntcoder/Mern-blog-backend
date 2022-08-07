import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import { PostController, UserController } from "./controllers/index.js";
import { registerValidation, loginValidation } from "./validations/auth.js";
import { postCreateValidation } from "./validations/post.js";
import { checkAuth, handleValidationError } from "./utils/index.js";

mongoose
  .connect("process.env.MONGO_DB_URL")
  .then(() => {
    console.log("DB ok");
  })
  .catch((err) => console.log(err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },

  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.use("/uploads", express.static("uploads"));
app.post(
  "/auth/login",
  loginValidation,
  handleValidationError,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationError,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getUser);
app.get("/posts/populate", PostController.getPopulate);
app.get("/tags", PostController.getLastTags);
app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationError,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationError,
  PostController.update
);

app.listen(process.env.PORT || 7777, (err) => {
  if (err) {
    console.log(err);
  }

  console.log("Server Ок");
});
