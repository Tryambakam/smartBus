require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../db");
const User = require("../models/User");

async function run() {
  await connectDB();

  const email = process.env.SEED_USER_EMAIL || process.env.SEED_ADMIN_EMAIL || "user@smartbus.local";
  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    console.log("✅ Seed user already exists:", existing.email);
    process.exit(0);
  }

  const password = process.env.SEED_USER_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "User@12345";
  const name = process.env.SEED_USER_NAME || "Seed User";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  console.log("✅ User created:");
  console.log("Email:", user.email);
  console.log("Password:", password);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
