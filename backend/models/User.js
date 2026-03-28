import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  gender: String,
  bloodGroup: String,
  photo: String,
  password: String,

  // 🔥 REQUIRED FOR RESET FLOW
  resetToken: String,
  resetTokenExpiry: Date,
  otp: String,
  otpExpiry: Date
});

export default mongoose.model("User", userSchema);