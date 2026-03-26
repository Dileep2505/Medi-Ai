import express from "express";
import User from "../models/User.js";
import { nanoid } from "nanoid";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.post("/", async (req, res) => {
  try {
    let { userId, fullName, email, gender, bloodGroup, phone, photo } = req.body;

    if (!userId) userId = "USR-" + nanoid(6);

    let user = await User.findOne({ userId });

    if (user) {
      user.fullName = fullName;
      user.email = email; // 🔥 CRITICAL
      user.gender = gender;
      user.bloodGroup = bloodGroup;
      user.phone = phone;
      user.photo = photo;
    } else {
      user = new User({
        userId,
        fullName,
        email, // 🔥 CRITICAL
        gender,
        bloodGroup,
        phone,
        photo
      });
    }

    await user.save();

    // 🔥 RETURN EMAIL ALSO
    res.json({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      gender: user.gender,
      bloodGroup: user.bloodGroup || "",
      phone: user.phone || "",
      photo: user.photo || ""
    });

  } catch (err) {
    console.error("User save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

/* ================= CREATE / UPDATE PROFILE ================= */
router.post("/", async (req, res) => {
  try {
    let { userId, fullName, gender, bloodGroup,email, phone, photo } = req.body;

    if (!userId) userId = "USR-" + nanoid(6);

    let user = await User.findOne({ userId });

    if (user) {
  user.fullName = fullName;
  user.email = email; // ✅ ADD
  user.gender = gender;
  user.bloodGroup = bloodGroup;
  user.phone = phone;
  user.photo = photo;
} else {
  user = new User({
    userId,
    fullName,
    email, // ✅ ADD
    gender,
    bloodGroup,
    phone,
    photo
  });
}

    await user.save();

    // 🔥 RETURN CLEAN USER
    res.json({
      userId: user.userId,
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup || "",
      phone: user.phone || "",
      photo: user.photo || ""
    });

  } catch (err) {
    console.error("User save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

export default router;