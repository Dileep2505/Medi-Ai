import express from "express";
import User from "../models/User.js";
import { nanoid } from "nanoid";

const router = express.Router();

/* GET PROFILE */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* CREATE OR UPDATE PROFILE */
router.post("/", async (req, res) => {
  try {
    let { userId, name, gender, bloodGroup, phone, photo } = req.body;

    if (!userId) userId = "USR-" + nanoid(6);

    let user = await User.findOne({ userId });

    if (user) {
      user.name = name;
      user.gender = gender;
      user.bloodGroup = bloodGroup;
      user.phone = phone;
      user.photo = photo;
    } else {
      user = new User({ userId, name, gender, bloodGroup, phone, photo });
    }

    await user.save();
    res.json(user);

  } catch (err) {
    console.error("User save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

export default router;
