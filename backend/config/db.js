
import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Windows DNS resolving MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if cannot set
}

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ Fatal: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    console.log("MONGO_URI =", uri);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.log("💡 Tip: Verify your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).");
    isConnected = false;
    // Do not crash the entire process immediately so diagnostics and health checks can respond with clear errors
    return null;
  }
};

export const getDbStatus = () => isConnected && mongoose.connection.readyState === 1;

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected.");
  isConnected = false;
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection runtime error:", err.message);
  isConnected = false;
});
