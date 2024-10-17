import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import { fileURLToPath } from "url";
import authMiddleware from "./middleware/auth.js";
import collectionRoutes from "./routes/collection.js";
import clothingItemRoutes from "./routes/clothingItem.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/wardrobe");

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/auth", authRoutes);

// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/wardrobe", collectionRoutes);
app.use("/wardrobe", clothingItemRoutes);

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
