import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import client from "../utils/twilio.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

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

  if (!base) base = "user"; // ✅ fallback

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

  // ✅ guaranteed unique
  return base + "_" + Date.now().toString().slice(-5);
};

/* ================= USER ID ================= */
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

    const exists = await User.findOne({ username });

    if (!exists) return res.json({ available: true });

    const suggestions = [
      username + "_" + Math.floor(100 + Math.random() * 900),
      username + "." + Math.floor(1000 + Math.random() * 9000)
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

    if (!fullName || !email || !phone || !gender || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = normalizeEmail(email);

    // ✅ NORMALIZE PHONE
    phone = phone.replace(/\D/g, "");

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // ✅ AUTO USERNAME
    if (!username || username.trim() === "") {
      username = await generateUsername(fullName);
    } else {
      username = normalizeUsername(username);
    }

    // ✅ UNIQUE CHECKS
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
      return res.status(400).json({ message: "Duplicate field" });
    }

    res.status(500).json({ message: "Register failed" });
  }
});

/* ================= SEND OTP ============== */

import client from "../utils/twilio.js";

router.post("/send-otp", async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone required" });
    }

    // ✅ normalize
    phone = phone.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 180 * 1000;

    await user.save();

    // 🔥 SEND SMS
    await client.messages.create({
      body: `Your MediAI OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}` // change country code if needed
    });

    res.json({ message: "OTP sent to phone" });

  } catch (err) {
    console.error("TWILIO ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP ============ */

router.post("/verify-otp", async (req, res) => {
  try {
    let { phone, otp } = req.body;

    phone = phone.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({
      message: "OTP verified",
      userId: user.userId
    });

  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
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

    let input = identifier.trim();

    // ✅ NORMALIZE PHONE INPUT
    if (/^\+?\d+$/.test(input)) {
      input = input.replace(/\D/g, "");
    }

    let user;

    if (/^\d{10,15}$/.test(input)) {
      user = await User.findOne({ phone: input });
    } else if (input.includes("@")) {
      user = await User.findOne({ email: normalizeEmail(input) });
    } else {
      user = await User.findOne({ username: normalizeUsername(input) });
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
    user.phone = phone ? phone.replace(/\D/g, "") : user.phone;
    user.gender = gender ?? user.gender;
    user.bloodGroup = bloodGroup ?? user.bloodGroup;
    user.photo = photo ?? user.photo;

    await user.save();

    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ================= FORGOT PASSWORD ================= */
import SibApiV3Sdk from "sib-api-v3-sdk";

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO API KEY MISSING");
      return res.status(500).json({ message: "Email config missing" });
    }

    const user = await AuthUser.findOne({ email });

    if (!user) {
      return res.json({ message: "If email exists, reset sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `https://mediai.indevs.in/reset/${token}`;

    // 🔥 BREVO SETUP
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: {
        email: "medi.ai.0326@gmail.com",   // ⚠️ must be verified in Brevo
        name: "MediAI"
      },
      to: [{ email }],
      subject: "Reset your password",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>Click below:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    });

    res.json({ message: "Reset link sent" });

  } catch (err) {
    console.error("❌ BREVO ERROR:", err.response?.body || err.message);

    res.status(500).json({
      message: "Email failed",
      error: err.message
    });
  }
});

/* ================= RESET PASSWORD ================= */
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


router.post("/verify-otp", async (req, res) => {
  try {
    let { phone, otp } = req.body;

    phone = phone.replace(/\D/g, "").slice(-10);

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({
      message: "OTP verified",
      userId: user.userId
    });

  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;