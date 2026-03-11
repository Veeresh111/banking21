const router = require("express").Router();
const Loan = require("../models/Loan");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ loans });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, amount, termMonths, rate } = req.body;
    if (!type || !amount || !termMonths || !rate) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const loan = await Loan.create({
      userId: req.user.id,
      type,
      amount: Number(amount),
      termMonths: Number(termMonths),
      rate: Number(rate),
    });

    return res.json({ msg: "Loan application submitted", loan });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ msg: "Loan not found" });
    }

    return res.json({ msg: "Loan status updated", loan });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
