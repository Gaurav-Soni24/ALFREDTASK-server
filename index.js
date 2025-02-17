import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import flashcardRoutes from './routes/flashcards.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ credentials: true }));
app.use(express.json());

// Environment Variables
const { MONGODB_URI, PORT = 3000 } = process.env;

console.log(MONGODB_URI);

if (!MONGODB_URI) {
  console.error("MongoDB URI is missing! Check your .env file.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

// MongoDB Connection Events
mongoose.connection.on("connected", () => console.log("MongoDB is connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err.message));
mongoose.connection.on("disconnected", () => console.warn("MongoDB is disconnected"));

// Routes
app.get("/", (req, res) => res.send("Welcome to the Alfred Task API!"));
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));