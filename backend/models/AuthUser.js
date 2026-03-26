import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date
});

export default mongoose.model("AuthUser", schema);
