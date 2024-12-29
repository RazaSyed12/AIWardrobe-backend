// import express from "express";
// import Wardrobe from "../models/Wardrobe.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     // Extract the authenticated user's ID from req.user (from the JWT)
//     const userId = req.user._id;

//     // Fetch the user's wardrobe
//     const wardrobe = await Wardrobe.findOne({ userId });

//     if (!wardrobe) {
//       return res.status(200).json({
//         message: "Wardrobe retrieved successfully",
//         collections: [], // Return an empty array if wardrobe is not found
//       });
//     }

//     res.status(200).json({
//       message: "Wardrobe retrieved successfully",
//       collections: wardrobe.collections || [], // Return the collections, or an empty array if no collections are present
//     });
//   } catch (error) {
//     console.error("Error retrieving wardrobe:", error.message);
//     res.status(500).json({
//       error: "An error occurred while retrieving the wardrobe.",
//     });
//   }
// });

// export default router;

import express from "express";
import Wardrobe from "../models/Wardrobe.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Use auth middleware
router.use(authMiddleware);

/**
 * GET /wardrobe
 * Return the entire wardrobe + collections
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const wardrobe = await Wardrobe.findOne({ userId });

    if (!wardrobe) {
      return res.status(200).json({
        message: "Wardrobe retrieved successfully",
        collections: [], // or an empty array if not found
      });
    }

    res.status(200).json({
      message: "Wardrobe retrieved successfully",
      collections: wardrobe.collections || [],
    });
  } catch (error) {
    console.error("Error retrieving wardrobe:", error.message);
    res.status(500).json({
      error: "An error occurred while retrieving the wardrobe.",
    });
  }
});

export default router;
