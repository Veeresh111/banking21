const router = require("express").Router();
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

async function ensureAccounts(userId) {
  const existing = await Account.find({ userId }).sort({ createdAt: 1 });
  if (existing.length > 0) return existing;

  return Account.insertMany([
    { userId, type: "Checking", balance: 2500 },
    { userId, type: "Savings", balance: 1200 },
  ]);
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const accounts = await ensureAccounts(req.user.id);
    return res.json({ accounts });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const accounts = await ensureAccounts(req.user.id);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return res.json({
      totalBalance,
      accountCount: accounts.length,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/deposit", authMiddleware, async (req, res) => {
  try {
    const { accountId, amount, note } = req.body;
    const numericAmount = Number(amount);

    if (!accountId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ msg: "Valid account and amount are required" });
    }

    const account = await Account.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    account.balance += numericAmount;
    await account.save();

    await Transaction.create({
      userId: req.user.id,
      accountId: account._id,
      type: "deposit",
      amount: numericAmount,
      description: note || "Deposit",
    });

    return res.json({
      msg: "Deposit successful",
      account,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { accountId, amount, note } = req.body;
    const numericAmount = Number(amount);

    if (!accountId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ msg: "Valid account and amount are required" });
    }

    const account = await Account.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    if (account.balance < numericAmount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    account.balance -= numericAmount;
    await account.save();

    await Transaction.create({
      userId: req.user.id,
      accountId: account._id,
      type: "payment",
      amount: numericAmount,
      description: note || "Withdrawal",
    });

    return res.json({
      msg: "Withdrawal successful",
      account,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, nickname, initialDeposit } = req.body;
    if (!type) {
      return res.status(400).json({ msg: "Account type is required" });
    }

    const numericDeposit = Number(initialDeposit) || 0;
    if (numericDeposit < 0) {
      return res.status(400).json({ msg: "Initial deposit must be positive" });
    }

    const account = await Account.create({
      userId: req.user.id,
      type,
      balance: numericDeposit,
      currency: "USD",
      nickname: nickname ? nickname.trim() : "",
    });

    if (numericDeposit > 0) {
      await Transaction.create({
        userId: req.user.id,
        accountId: account._id,
        type: "deposit",
        amount: numericDeposit,
        description: "Initial deposit",
      });
    }

    return res.json({ msg: "Account created", account });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { nickname } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { nickname: nickname ? nickname.trim() : "" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    return res.json({ msg: "Account updated", account });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    if (account.balance > 0) {
      return res.status(400).json({ msg: "Account must have zero balance to close" });
    }

    await account.deleteOne();
    return res.json({ msg: "Account closed" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
