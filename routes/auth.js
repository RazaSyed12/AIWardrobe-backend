import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
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
      profilePicUrl,
      gender,
      agreedToTerms,
    } = req.body;

    // Ensure that user agreed to terms
    if (!agreedToTerms) {
      return res
        .status(400)
        .json({ error: "You must agree to the terms and conditions." });
    }

    // Check if the username or email is already taken
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Create a new user object (password hashing will be handled by the pre-save middleware)
    const user = new User({
      username,
      email,
      password, // Do NOT hash the password here
      firstName,
      lastName,
      phone,
      dob,
      address,
      profilePicUrl,
      gender,
      agreedToTerms,
    });

    // Save the user to the database (the pre-save middleware will hash the password)
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
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
