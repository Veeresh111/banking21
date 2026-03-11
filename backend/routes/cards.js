const router = require("express").Router();
const Card = require("../models/Card");
const authMiddleware = require("../middleware/authMiddleware");

function generateLast4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ cards });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, limit } = req.body;
    if (!type) {
      return res.status(400).json({ msg: "Card type is required" });
    }

    const card = await Card.create({
      userId: req.user.id,
      type,
      last4: generateLast4(),
      limit: Number(limit) || 2000,
    });

    return res.json({ msg: "Card issued", card });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { limit } = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { limit: Number(limit) || 0 },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ msg: "Card not found" });
    }

    return res.json({ msg: "Card updated", card });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:id/freeze", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "frozen" },
      { new: true }
    );
    if (!card) {
      return res.status(404).json({ msg: "Card not found" });
    }
    return res.json({ msg: "Card frozen", card });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:id/unfreeze", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "active" },
      { new: true }
    );
    if (!card) {
      return res.status(404).json({ msg: "Card not found" });
    }
    return res.json({ msg: "Card unfrozen", card });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
