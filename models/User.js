import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      trim: true,
      default: null,
    },
    lastName: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return /\+?\d{10,14}/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    dob: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    profilePicUrl: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    agreedToTerms: {
      type: Boolean,
      required: true,
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
