import { execFile } from "child_process";
import path from "path";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "url"; // Handle __dirname in ES module
import Wardrobe from "../models/Wardrobe.js";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names

const router = express.Router();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage to keep the correct file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the original file extension
    const uniqueName = uuidv4() + ext; // Generate a unique name with the correct extension
    cb(null, uniqueName); // Save the file with the unique name
  },
});

// Set up multer to use the custom storage configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File is not an image"), false);
    }
    cb(null, true);
  },
});

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

      // Build the absolute path to the AI model script
      const aiModelPath = path.join(__dirname, "..", "ai_model", "ai_model.py");

      // Automatically trigger AI processing after upload
      execFile(
        "python",
        [aiModelPath, imagePath],
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

          res.status(201).json({
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

export default router;
