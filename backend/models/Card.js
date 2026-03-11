const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["debit", "credit", "virtual"],
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
    },
    limit: {
      type: Number,
      default: 2000,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
