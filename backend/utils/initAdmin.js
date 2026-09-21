import User from "../models/User.js";

/**
 * Ensures the primary system administrator (admin@medicare.health) exists in MongoDB Atlas.
 * If not found, provisions the default system administrator.
 */
export const ensureAdminUser = async () => {
  try {
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || "admin@medicare.health").toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || "Admin@Medicare2026!";

    let defaultAdmin = await User.findOne({ email: defaultAdminEmail });

    if (!defaultAdmin) {
      console.log(`🛡️ Provisioning system administrator: ${defaultAdminEmail}...`);
      defaultAdmin = await User.create({
        name: "System Administrator",
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        role: "Admin",
        status: "approved",
        title: "Chief Administrator",
        department: "Hospital Administration",
        phone: "+91 99999 00000",
      });
      console.log(`✅ Default Administrator created successfully: ${defaultAdmin.email}`);
    } else {
      let needsSave = false;
      if (defaultAdmin.role !== "Admin") {
        defaultAdmin.role = "Admin";
        needsSave = true;
      }
      if (defaultAdmin.status !== "approved") {
        defaultAdmin.status = "approved";
        needsSave = true;
      }
      if (needsSave) {
        await defaultAdmin.save();
      }
      console.log(`🛡️ System Administrator verified: ${defaultAdmin.email} (Status: ${defaultAdmin.status})`);
    }

    // Clean up any test accounts with 'hacker' in email
    await User.deleteMany({ email: { $regex: /^hacker/i } });
  } catch (error) {
    console.error("❌ Error ensuring default administrator account:", error.message);
  }
};

export default ensureAdminUser;
