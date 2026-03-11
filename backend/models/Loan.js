const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["personal", "home", "auto", "business"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    termMonths: {
      type: Number,
      required: true,
      min: 3,
    },
    rate: {
      type: Number,
      required: true,
      min: 1,
      max: 40,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
