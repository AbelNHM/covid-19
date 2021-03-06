const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { hashPassword } = require("../lib/hash");
const { ensureAuthenticated } = require("../middlewares/authentication");
const uploadCloudinaryAvatar = require("../middlewares/uploadImage");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.json({ success: true, user: req.user.toJSON() });
});

// update profile
router.post("/", ensureAuthenticated, async (req, res, next) => {
  const { username, password, email, name, surname } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: "Invalid data" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser || username === req.user.username) {
      const editUser = await User.findOne(req.user._id);
      Object.assign(editUser, {
        username,
        password: hashPassword(password),
        email,
        name,
        surname
      });
      await editUser.save();
      res.json({ success: true, message: "Profile updated" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "The user already exists" });
    }
  } catch (e) {
    next(e);
  }
});

// upload profile image to Cloudinary and update user
router.post(
  "/image",
  ensureAuthenticated,
  uploadCloudinaryAvatar.single("image"),
  async (req, res, next) => {
    try {
      const editUser = await User.findOne(req.user._id);
      Object.assign(editUser, { image: req.file });
      await editUser.save();
      return res.json({ success: true, user: editUser.toJSON() });
    } catch (e) {
      next(e);
    }
  }
);

// change theme settings
router.post("/theme", ensureAuthenticated, async (req, res, next) => {
  const { theme } = req.body;
  try {
    const userFound = await User.findById(req.user._id);
    userFound.settings.theme = theme;
    await userFound.save();
    return res.json({ success: true, message: "Profile updated" });
  } catch (e) {
    next(e);
  }
});

// get theme settings
router.get("/theme", ensureAuthenticated, async (req, res, next) => {
  try {
    const {
      settings: { theme }
    } = await User.findById(req.user._id);
    return res.json({ success: true, theme });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
