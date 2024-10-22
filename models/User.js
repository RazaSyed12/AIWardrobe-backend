import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true, // Mandatory field
      trim: true,
    },
    lastName: {
      type: String,
      required: true, // Mandatory field
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      default: null, // Optional, either username or email must be provided
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true, // Email is required
      unique: true, // Keep email unique
    },
    password: {
      type: String,
      required: true, // Mandatory field
      minlength: 6,
    },
    phone: {
      type: String,
      default: null, // Optional field
    },
    dob: {
      type: Date,
      default: null, // Optional field
    },
    address: {
      type: String,
      default: null, // Optional field
    },
    profilePicUrl: {
      type: String,
      default: null, // Optional field
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say", // Optional field
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // Optional field, default to "user"
    },
    agreedToTerms: {
      type: Boolean,
      default: false, // Optional field
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate a JWT token for the user
userSchema.methods.generateAuthToken = function () {
  const user = this;
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;

// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// // Define the User schema
// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// // Hash the password before saving the user
// userSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

// // Verify the password
// userSchema.methods.comparePassword = async function (password) {
//   console.log("Stored Password:", this.password); // Log stored hashed password
//   console.log("Provided Password:", password); // Log password entered by user
//   const isMatch = await bcrypt.compare(password, this.password);
//   console.log("Password Comparison Result:", isMatch);
//   return isMatch;
// };

// // Generate a JWT token for the user
// userSchema.methods.generateAuthToken = function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });
//   return token;
// };

// const User = mongoose.model("User", userSchema);

// export default User;
