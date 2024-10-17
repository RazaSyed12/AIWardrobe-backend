import express from "express";
import Wardrobe from "../models/Wardrobe.js";
import { clothesUpload } from "../middleware/imageUpload.js";
import multer from "multer";

const router = express.Router();

const upload = multer();

// Add a new collection to the wardrobe
router.post("/collections", upload.none(), async (req, res) => {
  try {
    const { userId, name } = req.body; // Expecting `userId` from the request body for now
    console.log(req.body);

    if (!name || !userId) {
      return res
        .status(400)
        .json({ error: "Collection name and userId are required." });
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

// Add a clothing item to a collection
router.post(
  "/collections/:collectionId/clothes",
  clothesUpload,
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { userId, name, primaryColor, secondaryColor, type } = req.body; // Include `userId` in request body

      if (!name || !primaryColor || !type || !userId) {
        return res
          .status(400)
          .json({
            error: "Clothing item, userId, and required fields are missing.",
          });
      }

      // Find the user's wardrobe
      const wardrobe = await Wardrobe.findOne({ userId });

      if (!wardrobe) {
        return res.status(404).json({ error: "Wardrobe not found." });
      }

      // Find the collection by ID
      const collection = wardrobe.collections.id(collectionId);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found." });
      }

      // Add the clothing item with the image URL
      collection.clothes.push({
        name,
        primaryColor,
        secondaryColor: secondaryColor || null,
        type,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      });

      // Save the updated wardrobe
      const updatedWardrobe = await wardrobe.save();

      res.status(201).json({
        message: "Clothing item added successfully",
        wardrobe: updatedWardrobe,
      });
    } catch (error) {
      console.error("Error adding clothing item:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while adding the clothing item." });
    }
  }
);

// Retrieve the entire wardrobe with collections and clothes
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user's wardrobe
    const wardrobe = await Wardrobe.findOne({ userId });

    // If wardrobe doesn't exist, return an empty response
    if (!wardrobe) {
      return res.status(200).json({
        message: "Wardrobe not found",
        wardrobe: { collections: [] },
      });
    }

    // Return the user's wardrobe
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

// import express from 'express';
// import Wardrobe from '../models/Wardrobe.js';
// import { clothesUpload } from '../middleware/imageUpload.js';
// import multer from 'multer';

// const router = express.Router();

// const upload = multer();

// // Add a new collection to the wardrobe
// router.post('/collections', upload.none(), async (req, res) => {
//   try {
//     const { name } = req.body;
//     console.log(req.body);

//     if (!name) {
//       return res.status(400).json({ error: "Collection name is required." });
//     }

//     // Find the user's wardrobe (assuming one wardrobe per user)
//     let wardrobe = await Wardrobe.findOne({ userId: req.user._id });

//     // If wardrobe does not exist, create a new one
//     if (!wardrobe) {
//       wardrobe = new Wardrobe({
//         userId: req.user._id,
//         collections: []
//       });
//     }

//     // Add the new collection
//     wardrobe.collections.push({
//       name,
//       clothes: []
//     });

//     // Save the wardrobe with the new collection
//     const updatedWardrobe = await wardrobe.save();

//     res.status(201).json({
//       message: 'Collection added successfully',
//       wardrobe: updatedWardrobe
//     });
//   } catch (error) {
//     console.error('Error adding collection:', error.message);
//     res.status(500).json({ error: 'An error occurred while adding the collection.' });
//   }
// });

// // Add a clothing item to a collection
// router.post('/collections/:collectionId/clothes', clothesUpload, async (req, res) => {
//   try {
//     const { collectionId } = req.params;
//     const { name, primaryColor, secondaryColor, type } = req.body;

//     if (!name || !primaryColor || !type) {
//       return res.status(400).json({ error: "Clothing item is missing required fields." });
//     }

//     // Find the user's wardrobe
//     const wardrobe = await Wardrobe.findOne({ userId: req.user._id });

//     if (!wardrobe) {
//       return res.status(404).json({ error: "Wardrobe not found." });
//     }

//     // Find the collection by ID
//     const collection = wardrobe.collections.id(collectionId);
//     if (!collection) {
//       return res.status(404).json({ error: "Collection not found." });
//     }

//     // Add the clothing item with the image URL
//     collection.clothes.push({
//       name,
//       primaryColor,
//       secondaryColor: secondaryColor || null,
//       type,
//       imageUrl: req.file ? `/uploads/${req.file.filename}` : null
//     });

//     // Save the updated wardrobe
//     const updatedWardrobe = await wardrobe.save();

//     res.status(201).json({
//       message: 'Clothing item added successfully',
//       wardrobe: updatedWardrobe
//     });
//   } catch (error) {
//     console.error('Error adding clothing item:', error.message);
//     res.status(500).json({ error: 'An error occurred while adding the clothing item.' });
//   }
// });

// // Retrieve the entire wardrobe with collections and clothes
// router.get('/', async (req, res) => {
//   try {
//     // Fetch the user's wardrobe
//     const wardrobe = await Wardrobe.findOne({ userId: req.user._id });

//     // If wardrobe doesn't exist, return an empty response
//     if (!wardrobe) {
//       return res.status(200).json({
//         message: 'Wardrobe not found',
//         wardrobe: { collections: [] }
//       });
//     }

//     // Return the user's wardrobe
//     res.status(200).json({
//       message: 'Wardrobe retrieved successfully',
//       wardrobe
//     });
//   } catch (error) {
//     console.error('Error retrieving wardrobe:', error.message);
//     res.status(500).json({ error: 'An error occurred while retrieving the wardrobe.' });
//   }
// });

// export default router;
