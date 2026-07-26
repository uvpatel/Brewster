import mongoose from "mongoose";


export  const connectDB = async () => {
    try {
       const conn =  mongoose.connect(process.env.MONGODB_URI as string);
       console.log("Mongo DB connected successfully👍🏻");
       
    } catch (error) {
        console.error("Error connecting to MongoDB 👎", error);
    }
}