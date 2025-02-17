import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    box: {
      type: Number,
      default: 1,
      min: 1,
      max: 6
    },
    nextReviewDate: {
      type: Date,
      default: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000) // Store as IST
    }
  },
  { timestamps: true }
);

// Function to calculate the next review date based on Leitner intervals
flashcardSchema.methods.calculateNextReviewDate = function () {
  const now = new Date();
  let daysToAdd = 0;

  switch (this.box) {
    case 1:
      daysToAdd = 0;
      break;
    case 2:
      daysToAdd = 1;
      break;
    case 3:
      daysToAdd = 3;
      break;
    case 4:
      daysToAdd = 7;
      break;
    case 5:
      daysToAdd = 15;
      break;
    case 6:
      daysToAdd = 30;
      break;
    default:
      daysToAdd = 0;
  }

  const nextDateUTC = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return new Date(nextDateUTC.getTime() + 5.5 * 60 * 60 * 1000); // Convert to IST
};

// Function to update the flashcard based on user's answer
flashcardSchema.methods.processReview = function (correct) {
  if (correct) {
    this.box = Math.min(this.box + 1, 6);
  } else {
    this.box = 1;
  }
  this.nextReviewDate = this.calculateNextReviewDate();
};

export default mongoose.model('Flashcard', flashcardSchema);
