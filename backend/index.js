import express from "express";
import dotenv from "dotenv";

import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.json()); //allows us to parse incoming requests : req.body

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
  connectDb(); //Make DB Connection
  console.log("Server running on port 3000");
});
