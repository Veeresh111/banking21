const router = require("express").Router();
const Account = require("../models/Account");
const Beneficiary = require("../models/Beneficiary");
const Transfer = require("../models/Transfer");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/scheduled", authMiddleware, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      userId: req.user.id,
      status: "scheduled",
    }).sort({ createdAt: -1 });
    return res.json({ transfers });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const transfers = await Transfer.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ transfers });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fromAccountId, beneficiaryId, amount, schedule } = req.body;
    const numericAmount = Number(amount);

    if (!fromAccountId || !beneficiaryId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ msg: "Valid transfer details are required" });
    }

    const account = await Account.findOne({ _id: fromAccountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    const beneficiary = await Beneficiary.findOne({
      _id: beneficiaryId,
      userId: req.user.id,
    });
    if (!beneficiary) {
      return res.status(404).json({ msg: "Beneficiary not found" });
    }

    if (account.balance < numericAmount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    account.balance -= numericAmount;
    await account.save();

    const transfer = await Transfer.create({
      userId: req.user.id,
      fromAccountId: account._id,
      beneficiaryId: beneficiary._id,
      amount: numericAmount,
      status: schedule ? "scheduled" : "completed",
    });

    await Transaction.create({
      userId: req.user.id,
      accountId: account._id,
      type: "transfer",
      amount: numericAmount,
      description: `Transfer to ${beneficiary.name}`,
    });

    return res.json({ msg: "Transfer submitted", transfer });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transfer) {
      return res.status(404).json({ msg: "Transfer not found" });
    }

    if (transfer.status !== "scheduled") {
      return res.status(400).json({ msg: "Only scheduled transfers can be canceled" });
    }

    transfer.status = "failed";
    await transfer.save();

    return res.json({ msg: "Transfer canceled", transfer });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
