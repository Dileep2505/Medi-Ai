import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

/* ================= HELPERS ================= */
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeUsername = (username) => username.trim().toLowerCase();

/* ================= USERNAME ================= */
const generateUsername = async (fullName) => {
  let base = fullName
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .split(" ")
    .join("_");

  if (!base) base = "user";

  for (let i = 0; i < 5; i++) {
    const candidate =
      i === 0
        ? base
        : `${base}_${Math.floor(1000 + Math.random() * 9000)}`;

    const exists = await User.findOne({ username: candidate });
    if (!exists) return candidate;
  }

  return `${base}_${Date.now()}`;
};

/* ================= USER ID ================= */
const generateUserId = () => crypto.randomBytes(6).toString("hex");

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    let { fullName, username, email, phone, gender, password } = req.body;

    if (!fullName || !email || !phone || !gender || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = normalizeEmail(email);
    phone = phone.replace(/\D/g, "");

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone" });
    }

    username = username?.trim()
      ? normalizeUsername(username)
      : await generateUsername(fullName);

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

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, user });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register failed" });
  }
});

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    let { phone } = req.body;
    phone = phone.replace(/\D/g, "");

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 180000;
    await user.save();

    console.log(`OTP for ${phone}: ${otp}`); // debug

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ message: "OTP failed" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    let { phone, otp } = req.body;
    phone = phone.replace(/\D/g, "");

    const user = await User.findOne({ phone });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // ✅ clear OTP after use
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Verified", userId: user.userId });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let user;

    if (/^\d{10,15}$/.test(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else if (identifier.includes("@")) {
      user = await User.findOne({ email: normalizeEmail(identifier) });
    } else {
      user = await User.findOne({ username: normalizeUsername(identifier) });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, user });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= FORGOT PASSWORD ================= */

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If exists, email sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      await sendEmail(
  email,
  "🔐 Reset Your MediAI Password",
  `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:25px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

      <h2 style="color:#2563eb; margin-bottom:10px;">MediAI</h2>
      <p style="color:#555;">AI-Powered Medical Report Analysis</p>

      <hr style="margin:20px 0;" />

      <h3 style="color:#111;">Reset Your Password</h3>

      <p style="color:#444; line-height:1.6;">
        We received a request to reset your password. Click the button below to proceed.
      </p>

      <!-- 🔥 BUTTON (HIGHLIGHTED LINK) -->
      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.CLIENT_URL}/#/reset/${token}"
           style="
             background:linear-gradient(135deg,#2563eb,#1d4ed8);
             color:white;
             padding:14px 24px;
             text-decoration:none;
             border-radius:8px;
             font-weight:bold;
             display:inline-block;
             font-size:16px;
             box-shadow:0 4px 10px rgba(0,0,0,0.2);
           ">
          Reset Password
        </a>
      </div>

      <!-- 🔗 FALLBACK LINK -->
      <p style="color:#666; font-size:14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p style="
        background:#f1f5f9;
        padding:10px;
        border-radius:6px;
        font-size:13px;
        word-break:break-all;
        color:#2563eb;
      ">
        ${process.env.CLIENT_URL}/#/reset/${token}
      </p>

      <!-- ⚠️ WARNING -->
      <p style="color:#dc2626; font-size:14px; margin-top:20px;">
        ⚠️ This link will expire in 15 minutes for security reasons.
      </p>

      <p style="color:#555; font-size:14px;">
        If you did not request this, you can safely ignore this email.
      </p>

      <hr style="margin:20px 0;" />

      <p style="font-size:12px; color:#999;">
        © ${new Date().getFullYear()} MediAI. All rights reserved.
      </p>

    </div>
  </div>
  `
);
    } catch (mailErr) {
      console.error("EMAIL FAILED:", mailErr.message);

      return res.json({
        message: "Reset link generated (email failed)"
      });
    }

    res.json({ message: "Email sent" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */

const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    console.log("RESET TOKEN:", token);

    // ✅ VALIDATION
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ STRONG PASSWORD RULE
    const strongPassword =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must include letters, numbers, and special characters"
      });
    }

    // ✅ FIND USER
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token" });
    }

    // ✅ HASH PASSWORD
    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    console.log("✅ PASSWORD UPDATED");

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR FULL:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

/* ================= TEST ================= */
router.get("/test", (req, res) => {
  res.send("Auth route working");
});

export default router;