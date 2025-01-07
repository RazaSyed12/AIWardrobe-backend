import express from "express";
import UserOutfit from "../models/UserOutfit.js";
import authMiddleware from "../middleware/auth.js";
import Wardrobe from "../models/Wardrobe.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

/**
 * ADD USER OUTFIT
 * POST /outfits/user-outfits
 */
router.post("/user-outfits", async (req, res) => {
  try {
    const userId = req.user._id;
    const { topId, bottomId, outfitName } = req.body;

    if (!topId || !bottomId) {
      return res
        .status(400)
        .json({ error: "topId and bottomId are required." });
    }

    // Find the wardrobe and validate that the clothing items exist
    const wardrobe = await Wardrobe.findOne({ userId });
    if (!wardrobe) {
      return res.status(404).json({ error: "Wardrobe not found." });
    }

    let topFound = false;
    let bottomFound = false;

    // Check all collections for the clothing items
    for (const collection of wardrobe.collections) {
      for (const clothingItem of collection.clothes) {
        if (clothingItem._id.toString() === topId) {
          topFound = true;
        }
        if (clothingItem._id.toString() === bottomId) {
          bottomFound = true;
        }
      }
    }

    if (!topFound || !bottomFound) {
      return res.status(400).json({
        error: "One or both clothing items not found in user's wardrobe.",
      });
    }

    // Create a new outfit with minimal or default scores
    const newOutfit = new UserOutfit({
      userId,
      topId,
      bottomId,
      outfitName,
      date: new Date(),
    });

    const savedOutfit = await newOutfit.save();
    res.status(201).json({
      message: "User outfit created successfully.",
      outfit: {
        outfitId: savedOutfit._id,
        topId: savedOutfit.topId,
        bottomId: savedOutfit.bottomId,
        outfitName: savedOutfit.outfitName,
        date: savedOutfit.date,
      },
    });
  } catch (error) {
    console.error("Error adding user outfit:", error.message);
    res.status(500).json({ error: "Failed to create user outfit." });
  }
});

/**
 * EDIT USER OUTFIT
 * PUT /outfits/user-outfits/:outfitId
 */
router.put("/user-outfits/:outfitId", async (req, res) => {
  try {
    const { outfitId } = req.params;
    const userId = req.user._id;
    const { topId, bottomId, overallScore, formalScore, casualScore } =
      req.body;

    const outfit = await UserOutfit.findOne({ _id: outfitId, userId });
    if (!outfit) {
      return res
        .status(404)
        .json({ error: "Outfit not found or does not belong to this user." });
    }

    // Update fields if provided
    if (topId !== undefined) outfit.topId = topId;
    if (bottomId !== undefined) outfit.bottomId = bottomId;
    if (overallScore !== undefined) outfit.overallScore = overallScore;
    if (formalScore !== undefined) outfit.formalScore = formalScore;
    if (casualScore !== undefined) outfit.casualScore = casualScore;

    await outfit.save();
    res.status(200).json({
      message: "User outfit updated successfully.",
      outfit,
    });
  } catch (error) {
    console.error("Error updating user outfit:", error.message);
    res.status(500).json({ error: "Failed to update user outfit." });
  }
});

/**
 * DELETE USER OUTFIT
 * DELETE /outfits/user-outfits/:outfitId
 */
router.delete("/user-outfits/:outfitId", async (req, res) => {
  try {
    const { outfitId } = req.params;
    const userId = req.user._id;

    const deletedOutfit = await UserOutfit.findOneAndDelete({
      _id: outfitId,
      userId,
    });
    if (!deletedOutfit) {
      return res
        .status(404)
        .json({ error: "Outfit not found or does not belong to this user." });
    }

    res.status(200).json({
      message: "User outfit deleted successfully.",
      outfitId,
    });
  } catch (error) {
    console.error("Error deleting user outfit:", error.message);
    res.status(500).json({ error: "Failed to delete user outfit." });
  }
});

/**
 * FETCH OUTFITS
 * GET /outfits/fetch-outfits?category=overallScore&preference=formal&page=1&limit=10
 */
router.get("/fetch-outfits", async (req, res) => {
  try {
    const userId = req.user._id;

    const outfits = await UserOutfit.find({ userId });

    res.status(200).json(outfits);
  } catch (error) {
    console.error("Error fetching outfits:", error.message);
    res.status(500).json({ error: "Failed to fetch outfits." });
  }
});

export default router;
