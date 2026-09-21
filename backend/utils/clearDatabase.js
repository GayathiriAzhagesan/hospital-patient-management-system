import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const clearDatabase = async () => {
  console.log("🧹 Connecting to MongoDB Atlas to initialize clean database state...");

  const conn = await connectDB();
  if (!conn) {
    console.error("❌ Could not connect to MongoDB Atlas.");
    process.exit(1);
  }

  try {
    console.log("🗑️  Removing mock/seed records from collections...");
    const [u, p, d, a, i] = await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Appointment.deleteMany({}),
      Invoice.deleteMany({}),
    ]);

    console.log(`✅ Cleared Users: ${u.deletedCount}`);
    console.log(`✅ Cleared Patients: ${p.deletedCount}`);
    console.log(`✅ Cleared Doctors: ${d.deletedCount}`);
    console.log(`✅ Cleared Appointments: ${a.deletedCount}`);
    console.log(`✅ Cleared Invoices: ${i.deletedCount}`);

    console.log("\n🎉 Database is now completely fresh and ready for live user registration!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
};

clearDatabase();
