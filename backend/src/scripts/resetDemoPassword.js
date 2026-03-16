require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  const email = process.env.DEMO_EMAIL || "admin@smartbus.local";
  const password = process.env.DEMO_PASSWORD || "Admin@12345";

  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash(password, 10);
  const r = await User.updateOne({ email }, { $set: { passwordHash } });

  if (r.matchedCount === 0) {
    await User.create({ name: "Demo User", email, passwordHash });
    console.log("✅ Demo user created:", email);
  } else {
    console.log("✅ Demo user password reset:", email);
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("❌ Reset demo password failed:", e);
  process.exit(1);
});

