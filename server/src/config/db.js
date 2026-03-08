import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết Nối Thành Công !");
    } catch (error) {
        console.log("Lỗi Kết Nối : ", error);
        process.exit(1);
    }
};

export default connectDB;