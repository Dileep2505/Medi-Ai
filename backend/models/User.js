import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },

    phone: {
      type: String,
      default: "",
      match: [/^\d{10,15}$/, "Invalid phone number"]
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: ""
    },

    bloodGroup: {
      type: String,
      default: ""
    },

    photo: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true // 🔥 adds createdAt & updatedAt
  }
);

export default mongoose.model("User", userSchema);