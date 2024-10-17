import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("Authentication failed");
    }

    // Attach the user to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

export default authMiddleware;
