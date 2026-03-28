import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // ✅ FIX
  secure: false, // TLS for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* 🔥 VERIFY CONNECTION ON START */
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ MAIL ERROR:", error);
  } else {
    console.log("✅ Mail server ready");
  }
});

export default transporter;