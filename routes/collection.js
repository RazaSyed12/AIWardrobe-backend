import express from "express";
import multer from "multer";
import Wardrobe from "../models/Wardrobe.js"; // Import the Wardrobe model

const router = express.Router();
const upload = multer(); // Middleware for handling multipart/form-data (if needed)

// Add a new collection to the wardrobe
router.post("/collections", upload.none(), async (req, res) => {
  try {
    const { name } = req.body;

    // Ensure the collection name is provided
    if (!name) {
      return res.status(400).json({ error: "Collection name is required." });
    }

    // Extract the userId from the authenticated user (via JWT middleware)
    const userId = req.user._id;

    // Find the user's wardrobe (assuming one wardrobe per user)
    let wardrobe = await Wardrobe.findOne({ userId });

    // If wardrobe does not exist, return an error
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Check if the collection already exists
    const collectionExists = wardrobe.collections.some(
      (collection) => collection.name === name
    );
    if (collectionExists) {
      return res
        .status(400)
        .json({ error: "A collection with this name already exists." });
    }

    // Add the new collection
    wardrobe.collections.push({
      name,
      clothes: [], // Initialize with an empty clothes array
    });

    // Save the wardrobe with the new collection
    const updatedWardrobe = await wardrobe.save();

    res.status(201).json({
      message: "Collection added successfully",
      wardrobe: updatedWardrobe,
    });
  } catch (error) {
    console.error("Error adding collection:", error.message);
    res.status(500).json({
      error: "An error occurred while adding the collection.",
      details: error.message,
    });
  }
});

// Get all collections from the user's wardrobe
router.get("/collections", async (req, res) => {
  try {
    // Extract the userId from the authenticated user (via JWT middleware)
    const userId = req.user._id;

    // Fetch the user's wardrobe
    const wardrobe = await Wardrobe.findOne({ userId });

    // If wardrobe doesn't exist, return an error
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Return all collections in the wardrobe
    res.status(200).json({
      message: "Collections retrieved successfully",
      collections: wardrobe.collections,
    });
  } catch (error) {
    console.error("Error retrieving collections:", error.message);
    res.status(500).json({
      error: "An error occurred while retrieving the collections.",
      details: error.message,
    });
  }
});

// Delete a collection from the wardrobe
router.delete("/collections/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Extract the userId from the authenticated user (via JWT middleware)
    const userId = req.user._id;

    // Fetch the user's wardrobe
    let wardrobe = await Wardrobe.findOne({ userId });

    // If wardrobe doesn't exist, return an error
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Find and remove the collection from the wardrobe
    wardrobe.collections = wardrobe.collections.filter(
      (collection) => collection._id.toString() !== collectionId
    );

    // Save the updated wardrobe
    const updatedWardrobe = await wardrobe.save();

    res.status(200).json({
      message: "Collection deleted successfully",
      wardrobe: updatedWardrobe,
    });
  } catch (error) {
    console.error("Error deleting collection:", error.message);
    res.status(500).json({
      error: "An error occurred while deleting the collection.",
      details: error.message,
    });
  }
});

export default router;
