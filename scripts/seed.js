const mongoose = require("mongoose");

require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DEFAULT_DEVS = [
  {
    name: "Yashvardhan Dhondge",
    email: "yashvardhan.dhondge@hare2.local",
    password: "yash@123",
  },
  {
    name: "Janhavi Kendre",
    email: "janhavi.kendre@hare2.local",
    password: "janhavi@123",
  },
  {
    name: "Aditya Chawale",
    email: "aditya.chawale@hare2.local",
    password: "aditya@123",
  },
  {
    name: "Mayank Chandratre",
    email: "mayank.chandratre@hare2.local",
    password: "mayank@123",
  },
];

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing required env vars: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "dev"] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    },
    { upsert: true, new: true }
  );

  console.log("Admin user seeded:", result.email);

  for (const dev of DEFAULT_DEVS) {
    const seededDev = await User.findOneAndUpdate(
      { email: dev.email },
      {
        name: dev.name,
        email: dev.email,
        password: dev.password,
        role: "dev",
      },
      { upsert: true, new: true }
    );
    console.log("Developer user seeded:", seededDev.email);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
