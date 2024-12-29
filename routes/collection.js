// import express from "express";
// import multer from "multer";
// import Wardrobe from "../models/Wardrobe.js"; // Import the Wardrobe model

// const router = express.Router();
// const upload = multer(); // Middleware for handling multipart/form-data (if needed)

// // Add a new collection to the wardrobe
// router.post("/collections", upload.none(), async (req, res) => {
//   try {
//     const { name } = req.body;

//     // Ensure the collection name is provided
//     if (!name) {
//       return res.status(400).json({ error: "Collection name is required." });
//     }

//     // Extract the userId from the authenticated user (via JWT middleware)
//     const userId = req.user._id;

//     // Find the user's wardrobe (assuming one wardrobe per user)
//     let wardrobe = await Wardrobe.findOne({ userId });

//     // If wardrobe does not exist, return an error
//     if (!wardrobe) {
//       return res
//         .status(404)
//         .json({ error: "Wardrobe not found for this user." });
//     }

//     // Check if the collection already exists
//     const collectionExists = wardrobe.collections.some(
//       (collection) => collection.name === name
//     );
//     if (collectionExists) {
//       return res
//         .status(400)
//         .json({ error: "A collection with this name already exists." });
//     }

//     // Add the new collection
//     wardrobe.collections.push({
//       name,
//       clothes: [], // Initialize with an empty clothes array
//     });

//     // Save the wardrobe with the new collection
//     const updatedWardrobe = await wardrobe.save();

//     res.status(201).json({
//       message: "Collection added successfully",
//       wardrobe: updatedWardrobe,
//     });
//   } catch (error) {
//     console.error("Error adding collection:", error.message);
//     res.status(500).json({
//       error: "An error occurred while adding the collection.",
//       details: error.message,
//     });
//   }
// });

// // Get all collections from the user's wardrobe
// router.get("/collections", async (req, res) => {
//   try {
//     // Extract the userId from the authenticated user (via JWT middleware)
//     const userId = req.user._id;

//     // Fetch the user's wardrobe
//     const wardrobe = await Wardrobe.findOne({ userId });

//     // If wardrobe doesn't exist, return an error
//     if (!wardrobe) {
//       return res
//         .status(404)
//         .json({ error: "Wardrobe not found for this user." });
//     }

//     // Return all collections in the wardrobe
//     res.status(200).json({
//       message: "Collections retrieved successfully",
//       collections: wardrobe.collections,
//     });
//   } catch (error) {
//     console.error("Error retrieving collections:", error.message);
//     res.status(500).json({
//       error: "An error occurred while retrieving the collections.",
//       details: error.message,
//     });
//   }
// });

// // Delete a collection from the wardrobe
// router.delete("/collections/:collectionId", async (req, res) => {
//   try {
//     const { collectionId } = req.params;

//     // Extract the userId from the authenticated user (via JWT middleware)
//     const userId = req.user._id;

//     // Fetch the user's wardrobe
//     let wardrobe = await Wardrobe.findOne({ userId });

//     // If wardrobe doesn't exist, return an error
//     if (!wardrobe) {
//       return res
//         .status(404)
//         .json({ error: "Wardrobe not found for this user." });
//     }

//     // Find and remove the collection from the wardrobe
//     wardrobe.collections = wardrobe.collections.filter(
//       (collection) => collection._id.toString() !== collectionId
//     );

//     // Save the updated wardrobe
//     const updatedWardrobe = await wardrobe.save();

//     res.status(200).json({
//       message: "Collection deleted successfully",
//       wardrobe: updatedWardrobe,
//     });
//   } catch (error) {
//     console.error("Error deleting collection:", error.message);
//     res.status(500).json({
//       error: "An error occurred while deleting the collection.",
//       details: error.message,
//     });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import Wardrobe from "../models/Wardrobe.js"; // Import the Wardrobe model
import authMiddleware from "../middleware/auth.js"; // Ensure you apply auth

const router = express.Router();
const upload = multer(); // For form-data if needed

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * CREATE COLLECTION
 * POST /wardrobe/collections
 */
router.post("/collections", upload.none(), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Collection name is required." });
    }

    const userId = req.user._id;
    let wardrobe = await Wardrobe.findOne({ userId });
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Check if collection with same name already exists
    const collectionExists = wardrobe.collections.some(
      (collection) => collection.name === name
    );
    if (collectionExists) {
      return res
        .status(400)
        .json({ error: "A collection with this name already exists." });
    }

    // Add new collection
    wardrobe.collections.push({ name, clothes: [] });
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

/**
 * GET ALL COLLECTIONS
 * GET /wardrobe/collections
 */
router.get("/collections", async (req, res) => {
  try {
    const userId = req.user._id;
    const wardrobe = await Wardrobe.findOne({ userId });

    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

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

/**
 * EDIT COLLECTION
 * PUT /wardrobe/collections/:collectionId
 */
router.put("/collections/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res
        .status(400)
        .json({ error: "New collection name is required." });
    }

    const wardrobe = await Wardrobe.findOne({ userId });
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Find the target collection
    const collection = wardrobe.collections.id(collectionId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found." });
    }

    // Update the name
    collection.name = name;

    const updatedWardrobe = await wardrobe.save();
    res.status(200).json({
      message: "Collection updated successfully",
      wardrobe: updatedWardrobe,
    });
  } catch (error) {
    console.error("Error updating collection:", error.message);
    res.status(500).json({
      error: "An error occurred while updating the collection.",
      details: error.message,
    });
  }
});

/**
 * DELETE COLLECTION
 * DELETE /wardrobe/collections/:collectionId
 */
router.delete("/collections/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id;

    const wardrobe = await Wardrobe.findOne({ userId });
    if (!wardrobe) {
      return res
        .status(404)
        .json({ error: "Wardrobe not found for this user." });
    }

    // Filter out the collection to delete
    wardrobe.collections = wardrobe.collections.filter(
      (collection) => collection._id.toString() !== collectionId
    );

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
