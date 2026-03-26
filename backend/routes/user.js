import express from "express";
import User from "../models/User.js";
import { nanoid } from "nanoid";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) return res.json({});

    res.json({
      userId: user.userId,
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup || "",
      phone: user.phone || "",
      photo: user.photo || ""
    });

  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* ================= CREATE / UPDATE PROFILE ================= */
router.post("/", async (req, res) => {
  try {
    let { userId, fullName, gender, bloodGroup, phone, photo } = req.body;

    if (!userId) userId = "USR-" + nanoid(6);

    let user = await User.findOne({ userId });

    if (user) {
      // 🔥 FIXED
      user.fullName = fullName;
      user.gender = gender;
      user.bloodGroup = bloodGroup;
      user.phone = phone;
      user.photo = photo;
    } else {
      user = new User({
        userId,
        fullName,
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