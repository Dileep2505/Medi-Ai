import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  gender: String,
  bloodGroup: String,
  phone: String,
  photo: String
});

export default mongoose.model("User", userSchema);
