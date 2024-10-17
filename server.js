import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import collectionRoutes from "./routes/collection.js";
import authMiddleware from "./middleware/auth.js";

dotenv.config(); // Load environment variables

const app = express();

mongoose.connect("mongodb://localhost:27017/wardrobe");

app.use(express.json()); // For parsing JSON request bodies
app.use("/uploads", express.static("uploads"));

// Public routes (no authentication required)
app.use("/auth", authRoutes);

// Protected routes (authentication required)
app.use("/wardrobe", collectionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
