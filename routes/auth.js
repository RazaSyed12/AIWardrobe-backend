import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validateRegistration } from '../middleware/validation.js';

const router = express.Router();

// Register a new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, number, dob } = req.body;
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      password,
      number,
      dob,
    });

    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send('Error registering user');
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid email or password');
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).send({ token });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).send('Error logging in user');
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const resetToken = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
      },
    });

    const mailOptions = {
      to: email,
      from: 'your_email@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://localhost:3000/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).send('Error resetting password');
  }
});

export default router;
