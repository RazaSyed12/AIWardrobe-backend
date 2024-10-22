import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer"; // For handling image uploads
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import Wardrobe from "../models/Wardrobe.js"; // Assuming you have a Wardrobe model
import { v4 as uuidv4 } from "uuid"; // For generating unique file names

const router = express.Router();

// Configure Multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = `uploads/users/temp`; // Temporary folder for users before creating their ID-based folder
    fs.mkdirSync(tempDir, { recursive: true }); // Ensure the directory exists
    cb(null, tempDir); // Save file in the temp folder first
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const uniqueName = uuidv4() + ext; // Generate a unique file name with the correct extension
    cb(null, uniqueName);
  },
});

// Multer middleware for profile picture uploads
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files (jpeg, jpg, png)
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Route for user registration with profile picture upload
router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      dob,
      address,
      gender,
      agreedToTerms,
    } = req.body;

    // Ensure that firstName, lastName, and password are provided
    if (!firstName || !lastName || !password) {
      return res
        .status(400)
        .json({ error: "First name, last name, and password are required." });
    }

    // Ensure email is provided (username is optional)
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Check if the email is already taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already taken" });
    }

    // Check if the username is already taken, if provided
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    // Create a new user object (password hashing will be handled by the pre-save middleware)
    const user = new User({
      username,
      email,
      password, // The password will be hashed by the User model's pre-save middleware
      firstName,
      lastName,
      phone,
      dob,
      address,
      gender,
      agreedToTerms,
    });

    // Save the user to the database (to get the user's ID)
    await user.save();

    // Create a wardrobe for the newly registered user
    const wardrobe = new Wardrobe({
      userId: user._id, // Associate the wardrobe with the user's ID
      collections: [], // Initialize with an empty collections array
    });

    // Save the wardrobe to the database
    await wardrobe.save();

    // Handle profile picture upload (if present)
    let profilePicUrl = null;
    if (req.file) {
      const userDir = `uploads/users/${user._id}/profilephoto`; // Directory based on the user's ID
      fs.mkdirSync(userDir, { recursive: true }); // Ensure the user-specific directory exists

      // Move the file from the temp folder to the user-specific folder
      const ext = path.extname(req.file.originalname);
      const newFilename = `profile${ext}`; // Save file as "profile.jpg" or "profile.png"
      const newPath = path.join(userDir, newFilename);
      fs.renameSync(req.file.path, newPath); // Move the file

      // Set the profilePicUrl for the user
      profilePicUrl = `/uploads/users/${user._id}/profilephoto/${newFilename}`;
      user.profilePicUrl = profilePicUrl; // Update user's profilePicUrl
      await user.save(); // Save the updated user with the profilePicUrl
    }

    // Generate a JWT token
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the user and token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicUrl: user.profilePicUrl,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res
      .status(500)
      .json({ error: "Error registering user", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid username/email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res
      .status(500)
      .json({ error: "Error logging in user", details: error.message });
  }
});

export default router;
