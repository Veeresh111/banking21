const router = require("express").Router();
const Beneficiary = require("../models/Beneficiary");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ beneficiaries });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, bank, accountNumber, ifsc } = req.body;

    if (!name || !bank || !accountNumber || !ifsc) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const cleanedAccount = String(accountNumber).replace(/\s+/g, "");
    if (cleanedAccount.length < 6) {
      return res.status(400).json({ msg: "Account number looks too short" });
    }

    const beneficiary = await Beneficiary.create({
      userId: req.user.id,
      name: name.trim(),
      bank: bank.trim(),
      accountNumber: cleanedAccount,
      ifsc: ifsc.trim().toUpperCase(),
    });

    return res.json({ msg: "Beneficiary added", beneficiary });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, bank, accountNumber, ifsc } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (bank) update.bank = bank.trim();
    if (accountNumber) update.accountNumber = String(accountNumber).replace(/\s+/g, "");
    if (ifsc) update.ifsc = ifsc.trim().toUpperCase();

    const beneficiary = await Beneficiary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );

    if (!beneficiary) {
      return res.status(404).json({ msg: "Beneficiary not found" });
    }

    return res.json({ msg: "Beneficiary updated", beneficiary });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!beneficiary) {
      return res.status(404).json({ msg: "Beneficiary not found" });
    }

    await beneficiary.deleteOne();
    return res.json({ msg: "Beneficiary removed" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
