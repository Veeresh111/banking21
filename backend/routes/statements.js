const router = require("express").Router();
const Statement = require("../models/Statement");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const statements = await Statement.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ statements });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ msg: "Month and year are required" });
    }

    const since = new Date(Number(year), Number(month) - 1, 1);
    const until = new Date(Number(year), Number(month), 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      createdAt: { $gte: since, $lt: until },
    });

    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const statement = await Statement.create({
      userId: req.user.id,
      month: Number(month),
      year: Number(year),
      summary: `Total activity: $${total.toFixed(2)} across ${transactions.length} items.`,
    });

    return res.json({ msg: "Statement generated", statement });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
