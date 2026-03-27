import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js"; // ✅ FIXED
import { Resend } from "resend";

const router = express.Router();

/* ================= HELPERS ================= */
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeUsername = (username) => username.trim().toLowerCase();

/* ================= USERNAME RULE ================= */
// 3 letters + special + 3-4 numbers
const generateUsername = async (fullName) => {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(" ")
    .join("_");

  const variants = [
    base,
    base + "_" + Math.floor(100 + Math.random() * 900),
    base + "." + Math.floor(100 + Math.random() * 900),
    base + "_" + Math.floor(1000 + Math.random() * 9000)
  ];

  for (let username of variants) {
    const exists = await User.findOne({ username });
    if (!exists) return username;
  }

  // fallback (guaranteed unique)
  return base + "_" + Date.now().toString().slice(-4);
};

/* ================= GENERATE USER ID ================= */
// 4 letters + "_" + 4 numbers
const generateUserId = () => {
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join("");

  const numbers = Math.floor(1000 + Math.random() * 9000);

  return `${letters}_${numbers}`;
};

/* ================= CHECK USERNAME ================= */
router.get("/check-username/:username", async (req, res) => {
  try {
    const username = normalizeUsername(req.params.username);

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        message: "Format: abc_123 or abc-1234"
      });
    }

    const exists = await User.findOne({ username });

    if (!exists) return res.json({ available: true });

    // ✅ VALID suggestions
    const suggestions = [
      username.slice(0, 3) + "_" + Math.floor(100 + Math.random() * 900),
      username.slice(0, 3) + "-" + Math.floor(1000 + Math.random() * 9000)
    ];

    res.json({ available: false, suggestions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ available: false });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    let { fullName, username, email, phone, gender, password } = req.body;

// 🔥 AUTO GENERATE if empty
if (!username || username.trim() === "") {
  username = await generateUsername(fullName);
}
    if (!fullName || !username || !email || !phone || !gender || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = normalizeEmail(email);
    username = normalizeUsername(username);

    // 🔥 VALIDATION

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    // 🔥 UNIQUE CHECKS
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email exists" });

    if (await User.findOne({ username }))
      return res.status(400).json({ message: "Username exists" });

    if (await User.findOne({ phone }))
      return res.status(400).json({ message: "Phone exists" });

    const hashed = await bcrypt.hash(password, 10);

    const userId = generateUserId();

    const user = await User.create({
      userId,
      fullName,
      username,
      email,
      phone,
      gender,
      password: hashed
    });

    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        userId,
        fullName,
        username,
        email,
        phone,
        gender,
        bloodGroup: "",
        photo: ""
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate field"
      });
    }

    res.status(500).json({ message: "Register failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email / Username / Phone required"
      });
    }

    let user;

    if (/^\d{10,15}$/.test(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else if (identifier.includes("@")) {
      user = await User.findOne({ email: normalizeEmail(identifier) });
    } else {
      user = await User.findOne({ username: normalizeUsername(identifier) });
    }

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        bloodGroup: user.bloodGroup || "",
        photo: user.photo || ""
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= UPDATE PROFILE ================= */
router.post("/profile", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      gender,
      bloodGroup,
      photo
    } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName ?? user.fullName;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.gender = gender ?? user.gender;
    user.bloodGroup = bloodGroup ?? user.bloodGroup;
    user.photo = photo ?? user.photo;

    await user.save();

    res.json({
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        bloodGroup: user.bloodGroup || "",
        photo: user.photo || ""
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ================= RESET FLOW (UNCHANGED BUT FIXED MODEL) ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: normalizeEmail(req.body.email) });

    if (!user) return res.json({ message: "If exists, email sent" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "no-reply@mediai.indevs.in",
      to: user.email,
      subject: "Reset Password",
      html: `<a href="https://mediai.indevs.in/reset/${token}">Reset</a>`
    });

    res.json({ message: "Reset link sent" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password updated" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

export default router;