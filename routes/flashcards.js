import express from "express";
import { body, validationResult } from "express-validator";
import Flashcard from "../models/Flashcard.js";
import { auth } from "../middleware/auth.js";
import moment from "moment-timezone";

const router = express.Router();

// Get all flashcards for user
router.get("/", auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user.id }).sort({
      nextReviewDate: 1,
    });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get next flashcard for review
router.get("/next", auth, async (req, res) => {
  try {
    const userTimezone = req.user.timezone || "Asia/Kolkata"; // Default to IST if not set

    // Get user's local midnight in UTC
    const userMidnightUTC = moment().tz(userTimezone).startOf("day").utc().toDate();

    console.log("Checking cards due before:", userMidnightUTC, "UTC");

    const card = await Flashcard.findOne({
      user: req.user.id,
      nextReviewDate: { $lte: userMidnightUTC },
    }).sort({ nextReviewDate: 1 });

    const dueCount = await Flashcard.countDocuments({
      user: req.user.id,
      nextReviewDate: { $lte: userMidnightUTC },
    });

    res.json({ card, dueCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create flashcard
router.post(
  "/",
  auth,
  [
    body("question").trim().notEmpty().withMessage("Question is required"),
    body("answer").trim().notEmpty().withMessage("Answer is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { question, answer } = req.body;
      const userId = req.user?.id;

      console.log("Creating flashcard for user:", userId);

      if (!userId) {
        console.error("Authentication error: User ID is missing.");
        return res
          .status(401)
          .json({ message: "Unauthorized - User ID is missing" });
      }

      const flashcard = new Flashcard({
        user: userId,
        question,
        answer,
        box: 1,
        nextReviewDate: moment().tz(req.user.timezone || "Asia/Kolkata").startOf("day").toDate(),
      });

      await flashcard.save();
      console.log("Flashcard successfully created:", flashcard);

      res.status(201).json(flashcard);
    } catch (error) {
      console.error("Flashcard creation error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update flashcard
router.put("/:id", auth, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    if (question) flashcard.question = question;
    if (answer) flashcard.answer = answer;

    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Review flashcard
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { correct } = req.body;
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    flashcard.processReview(correct);
    await flashcard.save();

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete flashcard
router.delete("/:id", auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    res.json({ message: "Flashcard deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
