import { execFile } from "child_process";
import path from "path";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "url"; // Handle __dirname in ES module
import Wardrobe from "../models/Wardrobe.js";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import authMiddleware from "../middleware/auth.js"; // Import the auth middleware
import fs from "fs"; // For file and directory operations

const router = express.Router();

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage to keep the correct file extension and organize by user
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user._id.toString(); // Get the user ID from the authenticated user
    const userDir = `uploads/users/${userId}/clothingItems`; // Create directory for the user's clothing items
    fs.mkdirSync(userDir, { recursive: true }); // Ensure the user directory exists
    cb(null, userDir); // Save files in the user's clothingItems directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
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
      const { name } = req.body;

      // Extract the authenticated user's ID from req.user (from the JWT)
      const userId = req.user._id.toString();

      if (!name || !req.file) {
        return res
          .status(400)
          .json({ error: "Clothing name and image are required." });
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
        imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`, // Save the image URL
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
        "users",
        userId,
        "clothingItems",
        path.basename(clothingItem.imageUrl)
      );

      // Build the absolute path to the AI model script
      const aiModelPath = path.join(__dirname, "..", "ai_model", "ai_model.py");

      // Automatically trigger AI processing after upload
      execFile(
        "python3",
        [aiModelPath, imagePath],
        async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing AI model: ${error.message}`);
            return res
              .status(500)
              .json({ error: "Error processing the image" });
          }

          if (stderr) {
            console.error(`AI Model STDERR: ${stderr}`);
          }

          // Parse AI model result (primaryColor, secondaryColor, and type)
          const [primaryColor, secondaryColor, type] = stdout.trim().split(",");

          if (!primaryColor || !type) {
            console.error("AI model returned invalid output.");
            return res.status(500).json({ error: "AI processing failed" });
          }

          // Update the clothing item with AI-generated values
          clothingItem.primaryColor = primaryColor;
          clothingItem.secondaryColor = secondaryColor || null;
          clothingItem.type = type;

          await wardrobe.save(); // Save the updated wardrobe

          // console.log("Clothing item processed and saved:", {
          //   primaryColor,
          //   secondaryColor,
          //   type,
          // });

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

// import { execFile } from "child_process";
// import path from "path";
// import express from "express";
// import multer from "multer";
// import { fileURLToPath } from "url";
// import Wardrobe from "../models/Wardrobe.js";
// import { v4 as uuidv4 } from "uuid"; // For generating unique file names
// import fs from "fs"; // For file and directory operations
// import fetch from "node-fetch";
// import FormData from "form-data";

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure multer storage to keep the correct file extension and organize by user
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const userId = req.user._id.toString(); // Get the user ID from the authenticated user
//     const userDir = `uploads/users/${userId}/clothingItems`; // Create directory for the user's clothing items
//     fs.mkdirSync(userDir, { recursive: true }); // Ensure the user directory exists
//     cb(null, userDir); // Save files in the user's clothingItems directory
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname); // Get the file extension
//     const uniqueName = uuidv4() + ext; // Generate a unique name with the correct extension
//     cb(null, uniqueName); // Save the file with the unique name
//   },
// });

// // Set up multer to use the custom storage configuration
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     // Only allow image files
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("File is not an image"), false);
//     }
//     cb(null, true);
//   },
// });

// // Function to remove background using remove.bg API
// async function removeBackground(imagePath, apiKey) {
//   const formData = new FormData();
//   formData.append("size", "auto");
//   formData.append("image_file", fs.createReadStream(imagePath));

//   try {
//     const response = await fetch("https://api.remove.bg/v1.0/removebg", {
//       method: "POST",
//       headers: { "X-Api-Key": apiKey },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to remove background: ${response.statusText}`);
//     }

//     return await response.buffer(); // Return buffer to be written to the file system
//   } catch (error) {
//     console.error("Error removing background:", error.message);
//     throw error;
//   }
// }

// // Route to add a clothing item to a collection (with automatic AI processing)
// router.post(
//   "/collections/:collectionId/clothes",
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { collectionId } = req.params;
//       const { name } = req.body;

//       // Extract the authenticated user's ID from req.user (from the JWT)
//       const userId = req.user._id.toString();

//       if (!name || !req.file) {
//         return res
//           .status(400)
//           .json({ error: "Clothing name and image are required." });
//       }

//       // Find the collection in the user's wardrobe
//       const wardrobe = await Wardrobe.findOne({
//         userId,
//         "collections._id": collectionId,
//       });
//       if (!wardrobe) {
//         return res.status(404).json({ error: "Collection not found." });
//       }

//       const imagePath = path.join(__dirname, "..", req.file.path); // Path of the original uploaded image

//       // Step 1: Remove background using Remove.bg
//       try {
//         const bgRemovedData = await removeBackground(
//           imagePath,
//           process.env.BG_API_KEY
//         );
//         // Write the background-removed image to the same file (overwrite original)
//         fs.writeFileSync(imagePath, bgRemovedData);

//         // Step 2: AI processing
//         const aiModelPath = path.join(
//           __dirname,
//           "..",
//           "ai_model",
//           "ai_model.py"
//         );
//         execFile(
//           "python",
//           [aiModelPath, imagePath],
//           async (error, stdout, stderr) => {
//             if (error || stderr) {
//               console.error("AI processing failed:", error || stderr);
//               return res.status(200).json({
//                 message:
//                   "AI could not analyze the image. Please provide clothing type.",
//                 imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`, // Background-removed image URL
//                 fallback: true, // User will need to input info manually
//               });
//             }

//             const [primaryColor, secondaryColor, type] = stdout
//               .trim()
//               .split(",");
//             if (!primaryColor || !type) {
//               return res.status(200).json({
//                 message:
//                   "AI could not process the image. Please input clothing details manually.",
//                 imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`,
//                 fallback: true,
//               });
//             }

//             // Step 3: Add clothing item to collection
//             const clothingItem = {
//               name,
//               imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`, // Use the background-removed image
//               primaryColor,
//               secondaryColor,
//               type,
//             };

//             const collection = wardrobe.collections.id(collectionId);
//             collection.clothes.push(clothingItem);
//             await wardrobe.save();

//             res.status(201).json({
//               message: "Clothing item added and processed successfully",
//               imageUrl: `/uploads/users/${userId}/clothingItems/${req.file.filename}`, // Background-removed image URL
//               clothingItem, // AI analyzed details
//               fallback: false, // No manual input needed
//             });
//           }
//         );
//       } catch (error) {
//         console.error("Background removal failed:", error.message);
//         res.status(500).json({ error: "Background removal failed." });
//       }
//     } catch (error) {
//       console.error("Error adding clothing item:", error.message);
//       res
//         .status(500)
//         .json({ error: "An error occurred while adding the clothing item." });
//     }
//   }
// );

// export default router;
