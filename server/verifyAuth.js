import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mongoURI = 'mongodb+srv://seven3v_db_user:5vmsIKbfBBdnvsc1@cluster0.du03bh0.mongodb.net/?appName=Cluster0';

async function checkUser() {
    try {
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;

        // Find the user who is trying to login
        const users = await db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users in the database.`);

        for (let user of users) {
            console.log(`- Email: ${user.email}, authProvider: ${user.authProvider}, hasPassword: ${!!user.password}`);
            if (user.password) {
                // Try parsing common passwords if it's a test account
                const is123456 = await bcrypt.compare('123456', user.password);
                console.log(`  > Password '123456' matches? ${is123456}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
