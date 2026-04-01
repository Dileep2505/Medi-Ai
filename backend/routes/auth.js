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

/* ================= USERNAME GENERATOR ================= */
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
        : `${base}_${Math.floor(100 + Math.random() * 900)}`;

    const exists = await User.findOne({ username: candidate });
    if (!exists) return candidate;
  }

  return `${base}_${Date.now()}`;
};

/* ================= CHECK USERNAME ================= */
router.get("/check-username/:username", async (req, res) => {
  try {
    const username = normalizeUsername(req.params.username);

    if (!username || username.length < 3) {
      return res.json({ available: false });
    }

    const exists = await User.findOne({ username });

    if (!exists) {
      return res.json({ available: true });
    }

    const suggestions = [];
    for (let i = 0; i < 5; i++) {
      suggestions.push(
        `${username}_${Math.floor(100 + Math.random() * 900)}`
      );
    }

    res.json({
      available: false,
      suggestions
    });

  } catch (err) {
    console.error("USERNAME CHECK ERROR:", err);
    res.status(500).json({ available: false });
  }
});

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

    if (!user) return res.json({ message: "If exists, email sent" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "https://mediai.indevs.in";
    const resetLink = `${clientUrl}/#/reset/${token}`;

    await sendEmail(
      email,
      "🔐 Reset Your MediAI Password",
      `
      <div style="font-family:Arial;padding:20px;max-width:600px;margin:0 auto;">
        <div style="background:#f0f9ff;padding:20px;border-radius:8px;border-left:4px solid #2563eb;">
          <h2 style="color:#1e40af;margin:0;">MediAI</h2>
          <p style="margin-top:10px;color:#333;">Hello,</p>
          <p style="color:#333;line-height:1.6;">
            You requested to reset your password. Click the button below to create a new password.
          </p>
          <div style="margin:20px 0;">
            <a href="${resetLink}"
              style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p style="color:#666;font-size:13px;margin-top:20px;">
            Or copy this link: <br />
            <code style="background:#e8f1ff;padding:8px;border-radius:4px;word-break:break-all;">${resetLink}</code>
          </p>
          <p style="color:#999;font-size:12px;margin-top:20px;">
            ⏱️ This link expires in <strong>15 minutes</strong>
          </p>
          <p style="color:#999;font-size:12px;margin-top:10px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
      `
    );

    res.json({ message: "Email sent" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= TEST ================= */
router.get("/test", (req, res) => {
  res.send("Auth route working");
});

export default router;