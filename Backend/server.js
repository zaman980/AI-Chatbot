import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from './routes/auth.js';
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

/* PARSE incoming Request */
app.use(express.json());
app.use(cors());

// API Routes register  
app.use('/api/auth', authRoutes);
app.use("/api", authMiddleware, chatRoutes);

// DB connection with caching (avoids reconnecting on every warm serverless call)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected with Database!");
    console.log("Database Name:", conn.connection.name);
    console.log("Host:", conn.connection.host);
  } catch (err) {
    console.log("Failed to connect with DataBase", err);
  }
};

// Always connect — needed for both local dev and Vercel serverless
connectDB();

// Only call app.listen() locally — Vercel doesn't use this, it calls the app directly
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`);
  });
}

export default app;