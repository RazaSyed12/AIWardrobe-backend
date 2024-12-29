import express from "express";
import UserOutfit from "../models/UserOutfit.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

/**
 * ADD USER OUTFIT
 * POST /outfits/user-outfits
 */
router.post("/user-outfits", async (req, res) => {
  try {
    const userId = req.user._id; // or req.user._id.toString()
    const { topId, bottomId } = req.body;

    if (!topId || !bottomId) {
      return res
        .status(400)
        .json({ error: "topId and bottomId are required." });
    }

    // Optional: Validate topId and bottomId belong to user's clothes, etc.

    // Create a new outfit with minimal or default scores
    const newOutfit = new UserOutfit({
      userId,
      topId,
      bottomId,
      name: "User Outfit",
      date: new Date(),
    });

    const savedOutfit = await newOutfit.save();
    res.status(201).json({
      message: "User outfit created successfully.",
      outfit: {
        outfitId: savedOutfit._id,
        topId: savedOutfit.topId,
        bottomId: savedOutfit.bottomId,
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

    const outfit = await AIOutfit.findOne({ _id: outfitId, userId });
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

    const deletedOutfit = await AIOutfit.findOneAndDelete({
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
    const {
      category = "overallScore",
      preference, // optional
      page = 1,
      limit = 10,
    } = req.query;

    // Validate query parameters
    const validCategories = [
      "overallScore",
      "formalScore",
      "casualScore",
      // "summerScore",
      // "winterScore",
      // "fashionScore",
      // Add additional categories if needed
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category parameter." });
    }

    // (Optional) Validate preference if you use that
    const validPreferences = [
      "formal",
      "casual" /* "summer", "winter", etc. */,
    ];
    if (preference && !validPreferences.includes(preference)) {
      return res.status(400).json({ error: "Invalid preference parameter." });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch outfits from DB, sorted by category
    let outfits = await AIOutfit.find({ userId })
      .sort({ [category]: -1 })
      .populate("topId", "imageUrl name") // Ensure topId references ClothingItem
      .populate("bottomId", "imageUrl name")
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by preference (only if the score > 0, or your logic)
    if (preference) {
      outfits = outfits.filter((outfit) => {
        const pScore = outfit[`${preference}Score`];
        return pScore && pScore > 0;
      });
    }

    // Format the response
    const formattedOutfits = outfits.map((outfit) => ({
      outfitId: outfit._id,
      topId: outfit.topId,
      bottomId: outfit.bottomId,
      overallScore: outfit.overallScore,
      formalScore: outfit.formalScore,
      casualScore: outfit.casualScore,
      date: outfit.date,
    }));

    res.status(200).json(formattedOutfits);
  } catch (error) {
    console.error("Error fetching outfits:", error.message);
    res.status(500).json({ error: "Failed to fetch outfits." });
  }
});

export default router;
