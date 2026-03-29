import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

/* ================= IMPORT ROUTES ================= */
import analyzeRouter from "./routes/analyze.js";
import userRouter from "./routes/user.js";
import authRoutes from "./routes/auth.js";

/* ================= VALIDATION ================= */
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

/* ================= APP ================= */
const app = express();
const PORT = process.env.PORT || 5000;


/* ================= CORS ================= */
const allowedOrigins = [
  "https://mediai.indevs.in",
  "https://dileep2505.github.io",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(null, false);
  },
  credentials: true
}));

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "10mb" }));

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ================= ROUTES ================= */
app.use("/api/analyze", analyzeRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRoutes);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("Backend API Running");
});

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ================= ERROR ================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  res.status(500).json({
    message: err.message || "Internal server error"
  });
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

console.log("ENV CHECK:", {
  jwt: process.env.JWT_SECRET ? "OK" : "MISSING",
  mongo: process.env.MONGO_URI ? "OK" : "MISSING",
  mail: process.env.MAIL_USER ? "OK" : "MISSING"
});