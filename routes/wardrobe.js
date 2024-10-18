import express from "express";
import Wardrobe from "../models/Wardrobe.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Extract the authenticated user's ID from req.user (from the JWT)
    const userId = req.user._id;

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
