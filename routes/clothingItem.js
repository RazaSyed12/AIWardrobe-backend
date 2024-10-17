import express from "express";
import multer from "multer";
import path from "path";
import Wardrobe from "../models/Wardrobe.js";
import { execFile } from "child_process";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Directory to save uploaded images

// Route to add a clothing item to a collection (with automatic AI processing)
router.post(
  "/collections/:collectionId/clothes",
  upload.single("image"),
  async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { userId, name } = req.body;

      if (!userId || !name || !req.file) {
        return res
          .status(400)
          .json({ error: "userId, name, and image are required." });
      }

      // Find the collection in the user's wardrobe
      const wardrobe = await Wardrobe.findOne({
        userId,
        "collections._id": collectionId,
      });
      if (!wardrobe) {
        return res.status(404).json({ error: "Collection not found." });
      }

      // Add the clothing item (name and image only for now)
      const newClothingItem = {
        name,
        imageUrl: `/uploads/${req.file.filename}`, // Save the image URL
        primaryColor: null, // Will be updated by AI model
        secondaryColor: null, // Will be updated by AI model
        type: null, // Will be updated by AI model
      };

      const collection = wardrobe.collections.id(collectionId);
      collection.clothes.push(newClothingItem); // Add clothing item to the collection
      const savedWardrobe = await wardrobe.save(); // Save the wardrobe

      const clothingItem = collection.clothes[collection.clothes.length - 1]; // Get the last added item
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(clothingItem.imageUrl)
      );

      // Automatically trigger AI processing after upload
      execFile(
        "python",
        ["../ai_model/ai_model.py", imagePath],
        async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing AI model: ${error.message}`);
            return res
              .status(500)
              .json({ error: "Error processing the image" });
          }

          // Parse AI model result (primaryColor, secondaryColor, and type)
          const [primaryColor, secondaryColor, type] = stdout.trim().split(",");

          // Update the clothing item with AI-generated values
          clothingItem.primaryColor = primaryColor;
          clothingItem.secondaryColor = secondaryColor || null;
          clothingItem.type = type;

          await wardrobe.save(); // Save the updated wardrobe

          res
            .status(201)
            .json({
              message: "Clothing item added and processed successfully",
              wardrobe,
            });
        }
      );
    } catch (error) {
      console.error("Error adding clothing item:", error.message);
      res
        .status(500)
        .json({ error: "An error occurred while adding the clothing item." });
    }
  }
);

// Route to retrieve all clothing items from a collection
router.get("/collections/:collectionId/clothes", async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Find the collection
    const wardrobe = await Wardrobe.findOne({
      "collections._id": collectionId,
    });
    if (!wardrobe) {
      return res.status(404).json({ error: "Collection not found." });
    }

    const collection = wardrobe.collections.id(collectionId);
    res
      .status(200)
      .json({ message: "Collection retrieved successfully", collection });
  } catch (error) {
    console.error("Error retrieving collection:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the collection." });
  }
});

export default router;
