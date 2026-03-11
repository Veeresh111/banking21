const router = require("express").Router();

router.post("/deposit", (req, res) => {
  return res.json({
    msg: "Preview deposit created",
    balance: 18460.45,
  });
});

module.exports = router;
