import express from "express";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route", user: req.user });
});

export default router;
