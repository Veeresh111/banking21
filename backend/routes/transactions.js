const router = require("express").Router();
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20);
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
