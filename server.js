// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import authMiddleware from "./middleware/auth.js";
// import collectionRoutes from "./routes/collection.js"; // Collection-related routes
// import clothingItemRoutes from "./routes/clothingItem.js"; // Clothing item-related routes
// import wardrobeRoutes from "./routes/wardrobe.js";
// import authRoutes from "./routes/auth.js"; // Authentication-related routes
// import userOutfitRoutes from "./routes/userOutfit.js"; // Outfit-related routes

// // Load environment variables from .env file
// dotenv.config();

// // Get __dirname equivalent in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Initialize express app
// const app = express();

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wardrobe")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Failed to connect to MongoDB", err));

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Serve static files for uploaded images
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes for authentication
// app.use("/auth", authRoutes);

// // Routes for collections and clothing items (under /wardrobe)
// app.use("/wardrobe", authMiddleware, collectionRoutes);
// app.use("/wardrobe", authMiddleware, clothingItemRoutes); // Handles clothing item addition to a collection
// app.use("/wardrobe", wardrobeRoutes);

// // Routes for outfit generation and retrieval
// app.use("/outfits", authMiddleware, userOutfitRoutes);

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.message);
//   res.status(500).json({ error: "An internal server error occurred." });
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}`);
// });

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Middleware & routes
import authMiddleware from "./middleware/auth.js";
import collectionRoutes from "./routes/collection.js";
import clothingItemRoutes from "./routes/clothingItem.js";
import wardrobeRoutes from "./routes/wardrobe.js";
import authRoutes from "./routes/auth.js"; // your Auth logic
import userOutfitRoutes from "./routes/userOutfit.js"; // user outfit
import aiRoutes from "./routes/ai.js"; // optional AI routes

dotenv.config();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/wardrobe")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Parse JSON bodies
app.use(express.json());

// Serve static files from uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes
app.use("/auth", authRoutes);

// Wardrobe & Collection & ClothingItem routes
// All behind auth (except if you allow public or partial access)
app.use("/wardrobe", authMiddleware, collectionRoutes);
app.use("/wardrobe", authMiddleware, clothingItemRoutes);
app.use("/wardrobe", authMiddleware, wardrobeRoutes);

// Outfit routes
app.use("/outfits", authMiddleware, userOutfitRoutes);

// (Optional) AI routes if needed
app.use("/api/ai", aiRoutes);

// Global error handling
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ error: "An internal server error occurred." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
