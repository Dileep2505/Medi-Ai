import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({
        userId,
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        bloodGroup: "",
        photo: ""
      });
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
    const {
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

    let user = await User.findOne({ userId });

    if (user) {
      // ✅ UPDATE (SAFE MERGE)
      user.fullName = fullName ?? user.fullName;
      user.email = email ?? user.email;
      user.gender = gender ?? user.gender;
      user.bloodGroup = bloodGroup ?? user.bloodGroup;
      user.phone = phone ?? user.phone;
      user.photo = photo ?? user.photo;
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
    res.status(500).json({ message: "Save failed" });
  }
});

export default router;