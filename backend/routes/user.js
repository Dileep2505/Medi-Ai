import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* ================= HELPERS ================= */
const normalizeEmail = (email) =>
  email ? email.trim().toLowerCase() : "";

const cleanPhone = (phone) =>
  phone ? phone.replace(/\D/g, "") : "";

/* ================= GET PROFILE ================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      userId: user.userId,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      bloodGroup: user.bloodGroup || "",
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
      return res.status(400).json({ message: "userId required" });
    }

    // ✅ sanitize
    email = normalizeEmail(email);
    phone = cleanPhone(phone);
    fullName = fullName?.trim();

    if (phone && !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone" });
    }

    let user = await User.findOne({ userId });

    if (user) {
      // ✅ UPDATE
      if (fullName !== undefined) user.fullName = fullName;
      if (email !== undefined) user.email = email;
      if (gender !== undefined) user.gender = gender;
      if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
      if (phone !== undefined) user.phone = phone;
      if (photo !== undefined) user.photo = photo;

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

    return res.json({
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

    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate data" });
    }

    res.status(500).json({ message: "Save failed" });
  }
});

export default router;