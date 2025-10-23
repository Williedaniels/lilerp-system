
const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const router = express.Router();

// User registration
router.post("/register", [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").isIn(["responder", "admin"]).withMessage("Invalid role")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = await User.create({ username, password, role });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });

    res.json({ token });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// User login
router.post("/login", [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });

    res.json({ token });

  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

module.exports = router;

