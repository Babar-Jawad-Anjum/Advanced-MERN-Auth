import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb Connected: ${connection.connection.host}`);
  } catch (err) {
    console.log("Error connection to MongoDb: ", err.message);
    process.exit(1); // 1 is failure, 0 status code is success
  }
};
