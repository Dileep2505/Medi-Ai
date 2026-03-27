import express from "express";
import User from "../models/User.js";
import AuthUser from "../models/AuthUser.js";
import { nanoid } from "nanoid";

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    const auth = await AuthUser.findOne({ userId });

    // 🔥 MERGE BOTH (CRITICAL FIX)
    const merged = {
      userId,
      fullName: user?.fullName || auth?.fullName || "",
      email: user?.email || auth?.email || "",
      phone: user?.phone || auth?.phone || "",
      gender: user?.gender || auth?.gender || "",
      bloodGroup: user?.bloodGroup || "",
      photo: user?.photo || ""
    };

    return res.json(merged);

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
      // ✅ UPDATE USER COLLECTION
      user.fullName = fullName ?? user.fullName;
      user.email = email ?? user.email;
      user.gender = gender ?? user.gender;
      user.bloodGroup = bloodGroup ?? user.bloodGroup;
      user.phone = phone ?? user.phone;
      user.photo = photo ?? user.photo;
    } else {
      // ✅ CREATE USER
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

    /* 🔥 SYNC WITH AUTHUSER (MOST IMPORTANT FIX) */
    const auth = await AuthUser.findOne({ userId });

    if (auth) {
      auth.fullName = fullName ?? auth.fullName;
      auth.email = email ?? auth.email;
      auth.phone = phone ?? auth.phone;
      auth.gender = gender ?? auth.gender;
      auth.bloodGroup = bloodGroup ?? auth.bloodGroup;
      auth.photo = photo ?? auth.photo;

      await auth.save();
    }

    // ✅ RETURN CLEAN MERGED DATA
    return res.json({
      userId,
      fullName: fullName || "",
      email: email || "",
      gender: gender || "",
      bloodGroup: bloodGroup || "",
      phone: phone || "",
      photo: photo || ""
    });

  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

export default router;