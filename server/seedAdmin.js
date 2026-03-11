import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "admin@example.com";
        const adminPassword = "admin123";
        const adminUsername = "SuperAdmin";

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("⚠️ Admin account already exists!");
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(adminPassword, salt);
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
            }
            await existingAdmin.save();
            console.log("✅ Updated existing user to Admin role and reset password to 'admin123'.");
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            authProvider: 'local'
        });

        console.log("🎉 Admin account created successfully!");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
