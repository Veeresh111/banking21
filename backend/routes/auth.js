const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const Account = require("../models/Account");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedMobile = String(mobile).replace(/\D/g, "");

    if (trimmedName.length < 2) {
      return res.status(400).json({ msg: "Full name is required" });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    if (!mobileRegex.test(trimmedMobile)) {
      return res.status(400).json({ msg: "Mobile must be 10 digits" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name: trimmedName,
      email: normalizedEmail,
      mobile: trimmedMobile,
      password: hashed,
    });

    await user.save();

    await Account.insertMany([
      {
        userId: user._id,
        type: "Checking",
        balance: 2500,
      },
      {
        userId: user._id,
        type: "Savings",
        balance: 1200,
      },
    ]);

    return res.json({ msg: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

// CURRENT USER
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE PROFILE
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const update = {};

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ msg: "Full name is required" });
      }
      update.name = trimmedName;
    }

    if (mobile) {
      const trimmedMobile = String(mobile).replace(/\D/g, "");
      if (!mobileRegex.test(trimmedMobile)) {
        return res.status(400).json({ msg: "Mobile must be 10 digits" });
      }
      update.mobile = trimmedMobile;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    }).select("-password");

    return res.json({ msg: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

// RESET PASSWORD (DEMO)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    return res.json({ msg: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router
