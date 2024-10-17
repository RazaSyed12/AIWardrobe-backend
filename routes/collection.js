import express from "express";
import Wardrobe from "../models/Wardrobe.js";
import { clothesUpload } from "../middleware/imageUpload.js";
import multer from "multer";

const router = express.Router();
const upload = multer(); // For parsing multipart form-data

// Add a new collection to the wardrobe
router.post("/collections", upload.none(), async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!userId || !name) {
      return res
        .status(400)
        .json({ error: "userId and collection name are required." });
    }

    // Find the user's wardrobe (assuming one wardrobe per user)
    let wardrobe = await Wardrobe.findOne({ userId });

    // If wardrobe does not exist, create a new one
    if (!wardrobe) {
      wardrobe = new Wardrobe({
        userId,
        collections: [],
      });
    }

    // Add the new collection
    wardrobe.collections.push({
      name,
      clothes: [],
    });

    // Save the wardrobe with the new collection
    const updatedWardrobe = await wardrobe.save();

    res.status(201).json({
      message: "Collection added successfully",
      wardrobe: updatedWardrobe,
    });
  } catch (error) {
    console.error("Error adding collection:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while adding the collection." });
  }
});

// Retrieve all collections from the user's wardrobe
router.get("/collections/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user's wardrobe
    const wardrobe = await Wardrobe.findOne({ userId });

    if (!wardrobe) {
      return res.status(404).json({ error: "Wardrobe not found." });
    }

    res.status(200).json({
      message: "Wardrobe retrieved successfully",
      wardrobe,
    });
  } catch (error) {
    console.error("Error retrieving wardrobe:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the wardrobe." });
  }
});

export default router;
