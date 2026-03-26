import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  fullName: String,
  username: { type: String, unique: true },

  email: { type: String, required: true, unique: true },
  phone: String,

  gender: String,
  bloodGroup: String,
  photo: String,

  password: { type: String, required: true },

  resetToken: String,
  resetTokenExpiry: Date
});

export default mongoose.model("AuthUser", schema);