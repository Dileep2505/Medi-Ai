import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AuthUser from "../models/AuthUser.js";
import { Resend } from "resend";

const router = express.Router();

/* ================= HELPERS ================= */
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeUsername = (username) => username.trim().toLowerCase();

/* ================= USERNAME VALIDATION ================= */
// 3 letters + special + 3-4 numbers
const usernameRegex = /^[a-zA-Z]{3}[_\-.][0-9]{3,4}$/;

/* ================= CHECK USERNAME ================= */
router.get("/check-username/:username", async (req, res) => {
  try {
    let username = normalizeUsername(req.params.username);

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        message: "Invalid username format"
      });
    }

    const exists = await AuthUser.findOne({ username });

    if (!exists) {
      return res.json({ available: true });
    }

    return res.json({
      available: false,
      suggestions: [
        username + Math.floor(Math.random() * 1000),
        username + "_123",
        username + "-456"
      ]
    });

  } catch (err) {
    console.error("USERNAME CHECK ERROR:", err);
    res.status(500).json({ available: false });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    let { fullName, username, email, phone, gender, password } = req.body;

    if (!fullName || !username || !email || !phone || !gender || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = normalizeEmail(email);
    username = normalizeUsername(username);

    // 🔥 VALIDATIONS
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be like abc_123"
      });
    }

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    // 🔥 CHECKS
    if (await AuthUser.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (await AuthUser.findOne({ username })) {
      return res.status(400).json({ message: "Username already taken" });
    }

    if (await AuthUser.findOne({ phone })) {
      return res.status(400).json({ message: "Phone already used" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 🔥 CUSTOM USER ID (your rule)
    const letters = crypto.randomBytes(2).toString("hex").slice(0, 4);
    const numbers = Math.floor(1000 + Math.random() * 9000);
    const userId = `${letters}_${numbers}`;

    const newUser = await AuthUser.create({
      userId,
      fullName,
      username,
      email,
      phone,
      gender,
      password: hashed
    });

    // 🔥 AUTO LOGIN TOKEN
    const token = jwt.sign(
      { userId: newUser.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        userId: newUser.userId,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        bloodGroup: "",
        photo: ""
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate field error"
      });
    }

    res.status(500).json({ message: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email / Username / Phone required"
      });
    }

    const input = identifier.trim();
    let user;

    // 🔥 DETECT TYPE
    if (/^\d{10,15}$/.test(input)) {
      user = await AuthUser.findOne({ phone: input });
    } else if (input.includes("@")) {
      user = await AuthUser.findOne({ email: normalizeEmail(input) });
    } else {
      user = await AuthUser.findOne({ username: normalizeUsername(input) });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
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

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    email = normalizeEmail(email);

    const user = await AuthUser.findOne({ email });
    if (!user) {
      return res.json({ message: "If email exists, reset sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "no-reply@mediai.indevs.in",
      to: email,
      subject: "Reset your password",
      html: `<a href="https://mediai.indevs.in/reset/${token}">Reset Password</a>`
    });

    res.json({ message: "Reset link sent" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await AuthUser.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
});

export default router;