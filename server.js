import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middleware/auth.js";
import collectionRoutes from "./routes/collection.js"; // Collection-related routes
import clothingItemRoutes from "./routes/clothingItem.js"; // Clothing item-related routes
import wardrobeRoutes from "./routes/wardrobe.js";
import authRoutes from "./routes/auth.js"; // Authentication-related routes

// Load environment variables from .env file
dotenv.config();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wardrobe")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes for authentication
app.use("/auth", authRoutes);

// Routes for collections and clothing items (under /wardrobe)
app.use("/wardrobe", authMiddleware, collectionRoutes);
app.use("/wardrobe", authMiddleware, clothingItemRoutes); // Handles clothing item addition to a collection
app.use("/wardrobe", wardrobeRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "An internal server error occurred." });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
