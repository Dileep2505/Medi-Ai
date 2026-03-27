import express from "express";
import User from "../models/User.js";
import { nanoid } from "nanoid";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.json({});
    }

    res.json({
      userId: user.userId,
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      bloodGroup: user.bloodGroup || "",
      phone: user.phone || "",
      photo: user.photo || ""
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* ================= CREATE / UPDATE PROFILE ================= */
router.post("/", async (req, res) => {
  try {
    let {
      userId,
      fullName,
      email,
      gender,
      bloodGroup,
      phone,
      photo
    } = req.body;

    if (!userId) {
      userId = "USR-" + nanoid(6);
    }

    let user = await User.findOne({ userId });

    if (user) {
      // ✅ UPDATE
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.gender = gender || user.gender;
      user.bloodGroup = bloodGroup || user.bloodGroup;
      user.phone = phone || user.phone;
      user.photo = photo || user.photo;
    } else {
      // ✅ CREATE
      user = new User({
        userId,
        fullName,
        email,
        gender,
        bloodGroup,
        phone,
        photo
      });
    }

    await user.save();

    // ✅ RETURN FULL DATA (IMPORTANT)
    res.json({
      userId: user.userId,
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      bloodGroup: user.bloodGroup || "",
      phone: user.phone || "",
      photo: user.photo || ""
    });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

export default router;