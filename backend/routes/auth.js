import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import transporter from "../utils/mailer.js";


const router = express.Router();

/* ================= HELPERS ================= */
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeUsername = (username) => username.trim().toLowerCase();

/* ================= USERNAME ================= */
const generateUsername = async (fullName) => {
  let base = fullName.toLowerCase().replace(/[^a-z ]/g, "").trim().split(" ").join("_");
  if (!base) base = "user";

  const variants = [
    base,
    base + "_" + Math.floor(100 + Math.random() * 900),
    base + "." + Math.floor(100 + Math.random() * 900),
    base + "_" + Math.floor(1000 + Math.random() * 9000)
  ];

  for (let u of variants) {
    if (!(await User.findOne({ username: u }))) return u;
  }

  return base + "_" + Date.now().toString().slice(-5);
};

/* ================= USER ID ================= */
const generateUserId = () => {
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(97 + Math.random() * 26)
  ).join("");

  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${letters}_${numbers}`;
};

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
    console.error(err);
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

  
    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error(err);
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

    res.json({ message: "Verified", userId: user.userId });

  } catch {
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

    let input = identifier.trim().replace(/\D/g, "");

    let user;

    if (/^\d{10,15}$/.test(input)) {
      user = await User.findOne({ phone: input });
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
    console.error(err);
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

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<a href="https://yourdomain.com/reset/${token}">Reset</a>`
    });

    res.json({ message: "Email sent" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

export default router;