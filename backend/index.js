import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // allow us to parse incoming requests : req.body
app.use(cookieParser()); // allow us to parse incoming cookies

app.use("/api/auth", authRoutes);

//ANy other router except above, send react application
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(process.env.PORT || 5000, () => {
  connectDb(); //Make DB Connection
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
