import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import Wardrobe from "../models/Wardrobe.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Fetch all wardrobes from the database
    const wardrobes = await Wardrobe.find();

    // If no wardrobes are found, return an empty array
    if (!wardrobes || wardrobes.length === 0) {
      return res.status(200).json({
        message: "No wardrobes found",
        wardrobes: [],
      });
    }

    // Return the list of wardrobes
    res.status(200).json({
      message: "Wardrobes retrieved successfully",
      wardrobes,
    });
  } catch (error) {
    console.error("Error retrieving wardrobes:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the wardrobes." });
  }
});

export default router;
