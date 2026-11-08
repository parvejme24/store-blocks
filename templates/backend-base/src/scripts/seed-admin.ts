import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../db/connection.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

async function main() {
  const adminName = process.env.ADMIN_NAME || "Store Administrator";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@storeblocks.dev").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123456!";

  logger.info({ email: adminEmail }, "Starting admin user seed process...");

  await connectDatabase();

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Check if database is MongoDB (mongoose is connected)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const UserSchema = new mongoose.Schema(
        {
          name: { type: String, required: true, trim: true },
          email: { type: String, required: true, unique: true, lowercase: true, trim: true },
          passwordHash: { type: String, required: true },
          role: { type: String, enum: ["customer", "admin"], default: "customer" },
          phone: { type: String },
          isActive: { type: Boolean, default: true }
        },
        { timestamps: true }
      );

      const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
      const existingUser = await UserModel.findOne({ email: adminEmail });

      if (existingUser) {
        logger.info({ email: adminEmail, id: existingUser._id }, "Admin user already exists. Skipping creation.");
      } else {
        const created = await UserModel.create({
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: "admin",
          isActive: true
        });
        logger.info({ email: adminEmail, id: created._id }, "Admin user successfully created in MongoDB!");
      }
    } else {
      // PostgreSQL database
      const { pool } = await import("../db/postgresql/connection.js");
      if (pool) {
        const existing = await pool.query(
          "SELECT id, email, role FROM users WHERE LOWER(email) = LOWER($1)",
          [adminEmail]
        );

        if (existing.rows.length > 0) {
          logger.info({ email: adminEmail, id: existing.rows[0].id }, "Admin user already exists. Skipping creation.");
        } else {
          const insertResult = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, role`,
            [adminName, adminEmail, passwordHash, "admin", true]
          );
          logger.info({ email: adminEmail, id: insertResult.rows[0].id }, "Admin user successfully created in PostgreSQL!");
        }
      } else {
        throw new Error("Unable to identify database connection type for seeding.");
      }
    }

    console.log("\n==================================================");
    console.log(" Admin Credentials Initialized Successfully");
    console.log("==================================================");
    console.log(` Email:    ${adminEmail}`);
    console.log(` Password: ${adminPassword}`);
    console.log(" Role:     admin (Store Owner / Full Access)");
    console.log("==================================================\n");
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  logger.error({ err }, "Admin seeding failed");
  process.exit(1);
});

