import express from "express";
import multer from "multer";
import Wardrobe from "../models/Wardrobe.js"; // Assuming you have a Wardrobe model

const router = express.Router();
const upload = multer();

// Add a new collection to the wardrobe
router.post("/collections", upload.none(), async (req, res) => {
  try {
    const { name } = req.body; // No need to send userId

    if (!name) {
      return res.status(400).json({ error: "Collection name is required." });
    }

    // Extract the userId from the authenticated user (via JWT middleware)
    const userId = req.user._id;

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

export default router;
