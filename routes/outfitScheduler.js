import express from "express";
import ScheduledOutfit from "../models/ScheduledOutfit.js";
import User from "../models/User.js";
import AIOutfit from "../models/AIOutfit.js";
import UserOutfit from "../models/UserOutfit.js";
const router = express.Router();
import moment from "moment";

// POST /api/schedule-outfit
router.post("/schedule-outfit", async (req, res) => {
  const { date, outfitId, userId } = req.body;

  // Validate input
  if (!date || !outfitId || !userId) {
    return res
      .status(400)
      .json({ message: "Date, outfitId, and userId are required." });
  }

  const parsedDate = moment(date, "DD/MM/YYYY", true);
  if (!parsedDate.isValid()) {
    return res
      .status(400)
      .json({ message: "Date must be in DD/MM/YYYY format." });
  }

  try {
    // Verify if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify if outfit exists in either AIOutfits or UserOutfits
    const [aiOutfit, userOutfit] = await Promise.all([
      AIOutfit.findById(outfitId),
      UserOutfit.findById(outfitId),
    ]);

    // If neither outfit exists, return error
    if (!aiOutfit && !userOutfit) {
      return res.status(404).json({ message: "Outfit not found." });
    }

    // Check if an outfit is already scheduled for this date
    const existingOutfit = await ScheduledOutfit.findOne({
      userId,
      scheduledDate: parsedDate.toDate(),
    });

    if (existingOutfit) {
      return res.status(400).json({
        message: "An outfit is already scheduled for this date.",
      });
    }

    const scheduledOutfit = new ScheduledOutfit({
      userId,
      outfitId,
      scheduledDate: parsedDate.toDate(),
    });

    await scheduledOutfit.save();

    res.status(201).json({
      message: "Outfit scheduled successfully.",
      data: scheduledOutfit,
    });
  } catch (error) {
    console.error("Error scheduling outfit:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// GET /api/outfit-scheduler/scheduled-outfits
router.get("/scheduled-outfits", async (req, res) => {
  try {
    const scheduledOutfits = await ScheduledOutfit.find();

    res.status(200).json({
      message: "Scheduled outfits retrieved successfully.",
      data: scheduledOutfits,
    });
  } catch (error) {
    console.error("Error retrieving scheduled outfits:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

router.get("/scheduled-outfits/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const scheduledOutfit = await ScheduledOutfit.findById(id)
      .populate("userId", "name email") // Adjust fields as necessary
      .populate("outfitId", "name description"); // Adjust fields as necessary

    if (!scheduledOutfit) {
      return res.status(404).json({ message: "Scheduled outfit not found." });
    }

    res.status(200).json({
      message: "Scheduled outfit retrieved successfully.",
      data: scheduledOutfit,
    });
  } catch (error) {
    console.error("Error retrieving scheduled outfit:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// DELETE /api/outfit-scheduler/scheduled-outfits/:id
router.delete("/scheduled-outfits/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const scheduledOutfit = await ScheduledOutfit.findByIdAndDelete(id);

    if (!scheduledOutfit) {
      return res.status(404).json({ message: "Scheduled outfit not found." });
    }

    res.status(200).json({
      message: "Scheduled outfit deleted successfully.",
      data: scheduledOutfit,
    });
  } catch (error) {
    console.error("Error deleting scheduled outfit:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});
//PATCH /api/outfit-scheduler/scheduled-outfits/:id
router.patch("/scheduled-outfits/:id", async (req, res) => {
  const { id } = req.params;
  const { date, outfitId, userId } = req.body;

  // Prepare update object
  const updateData = {};
  if (date) {
    const parsedDate = moment(date, "DD/MM/YYYY", true);
    if (!parsedDate.isValid()) {
      return res
        .status(400)
        .json({ message: "Date must be in DD/MM/YYYY format." });
    }
    updateData.scheduledDate = parsedDate.toDate();
  }

  if (outfitId) {
    updateData.outfitId = outfitId;
  }

  if (userId) {
    updateData.userId = userId;
  }

  try {
    const scheduledOutfit = await ScheduledOutfit.findById(id);

    if (!scheduledOutfit) {
      return res.status(404).json({ message: "Scheduled outfit not found." });
    }

    // If updating the date, check if another outfit is already scheduled for that date
    if (
      updateData.scheduledDate &&
      updateData.scheduledDate.toISOString() !==
        scheduledOutfit.scheduledDate.toISOString()
    ) {
      const existingOutfit = await ScheduledOutfit.findOne({
        userId: updateData.userId || scheduledOutfit.userId,
        scheduledDate: updateData.scheduledDate,
        _id: { $ne: id }, // Exclude current outfit
      });

      if (existingOutfit) {
        return res.status(400).json({
          message: "An outfit is already scheduled for this date.",
        });
      }
    }

    // Update the scheduled outfit
    Object.assign(scheduledOutfit, updateData);
    await scheduledOutfit.save();

    res.status(200).json({
      message: "Scheduled outfit updated successfully.",
      data: scheduledOutfit,
    });
  } catch (error) {
    console.error("Error updating scheduled outfit:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
