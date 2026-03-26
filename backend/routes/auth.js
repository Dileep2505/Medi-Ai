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

/* ================= CHECK USERNAME ================= */
router.get("/check-username/:username", async (req, res) => {
  try {
    let username = req.params.username;

    if (!username || username.length < 3) {
      return res.status(400).json({
        available: false,
        message: "Username too short"
      });
    }

    username = normalizeUsername(username);

    const exists = await AuthUser.findOne({ username });

    if (!exists) {
      return res.json({ available: true });
    }

    const suggestions = [
      username + Math.floor(Math.random() * 1000),
      username + "_123",
      username + "_official"
    ];

    return res.json({
      available: false,
      suggestions
    });

  } catch (err) {
    console.error("USERNAME CHECK ERROR:", err);
    return res.status(500).json({
      available: false,
      message: "Server error"
    });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    let {
      fullName,
      username,
      email,
      phone,
      gender,
      password
    } = req.body;

    if (
      !fullName ||
      !username ||
      !email ||
      !phone ||
      !gender ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = normalizeEmail(email);
    username = normalizeUsername(username);

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    const emailExists = await AuthUser.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const usernameExists = await AuthUser.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = "USR-" + crypto.randomBytes(4).toString("hex");

    const newUser = await AuthUser.create({
      fullName,
      username,
      email,
      phone,
      gender,
      password: hashed,
      userId
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: {
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        bloodGroup: newUser.bloodGroup || "",
        photo: newUser.photo || ""
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    return res.status(500).json({ message: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email / Username / Phone required"
      });
    }

    const input = email.trim();

    let user;

    // 🔥 DETECT INPUT TYPE
    if (/^\d{10,15}$/.test(input)) {
      // PHONE
      user = await AuthUser.findOne({ phone: input });
    } else if (input.includes("@")) {
      // EMAIL
      user = await AuthUser.findOne({
        email: input.toLowerCase()
      });
    } else {
      // USERNAME
      user = await AuthUser.findOne({
        username: input.toLowerCase()
      });
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
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
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

    const resend = new Resend(process.env.RESEND_API_KEY);

    const user = await AuthUser.findOne({ email });

    if (!user) {
      return res.json({ message: "If email exists, reset sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `https://mediai.indevs.in/reset/${token}`;

    await resend.emails.send({
      from: "no-reply@mediai.indevs.in",
      to: email,
      subject: "Reset your password",
      html: `<a href="${resetLink}">${resetLink}</a>`
    });

    return res.json({ message: "Reset link sent" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    return res.status(500).json({ message: "Reset failed" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

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

    return res.json({ message: "Password updated" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    return res.status(500).json({ message: "Password reset failed" });
  }
});

export default router;