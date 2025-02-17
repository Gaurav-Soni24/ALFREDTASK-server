import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Ensuring it's not double-hashed)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  console.log("Hashing Password:", this.password); // Debugging line

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    console.log("Hashed Password:", hashedPassword); // Debugging line
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("Incoming Password:", candidatePassword);
  console.log("Hashed Password in DB:", this.password);

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password Match Status:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Password Comparison Error:", error);
    return false;
  }
};

export default mongoose.model("User", userSchema);
