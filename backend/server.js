const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accounts");
const transactionRoutes = require("./routes/transactions");
const beneficiaryRoutes = require("./routes/beneficiaries");
const transferRoutes = require("./routes/transfers");
const insightRoutes = require("./routes/insights");
const demoRoutes = require("./routes/demo");
const cardRoutes = require("./routes/cards");
const loanRoutes = require("./routes/loans");
const statementRoutes = require("./routes/statements");
const alertRoutes = require("./routes/alerts");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/statements", statementRoutes);
app.use("/api/alerts", alertRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
