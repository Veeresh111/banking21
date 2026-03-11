const router = require("express").Router();
const Alert = require("../models/Alert");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ alerts });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!message) {
      return res.status(400).json({ msg: "Message is required" });
    }

    const alert = await Alert.create({
      userId: req.user.id,
      type,
      message,
    });

    return res.json({ msg: "Alert created", alert });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ msg: "Alert not found" });
    }

    return res.json({ msg: "Alert marked as read", alert });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
