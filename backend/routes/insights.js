const router = require("express").Router();
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/public", (req, res) => {
  return res.json({
    insights: [
      {
        title: "Build a 3-month cash buffer",
        detail: "Set aside 15% of deposits to grow your emergency fund.",
      },
      {
        title: "Automate bill payments",
        detail: "Reduce missed dues by scheduling recurring transfers.",
      },
      {
        title: "Track weekly spending",
        detail: "SmartBank flags high spending categories for you.",
      },
    ],
  });
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const recentTransactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalTransfers = recentTransactions
      .filter((tx) => tx.type === "transfer")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return res.json({
      insights: [
        {
          title: "Balance health",
          detail: `You currently have $${totalBalance.toFixed(2)} across your accounts.`,
        },
        {
          title: "Transfers this month",
          detail: `You moved $${totalTransfers.toFixed(2)} in recent transfers.`,
        },
        {
          title: "Security status",
          detail: "All devices verified. No new alerts.",
        },
      ],
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
