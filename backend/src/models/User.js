const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, trim: true },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["admin", "operator", "commuter"],
      default: "commuter",
    },

    busId: { type: String, trim: true, default: "" },

    passwordHash: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
