import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialDeposit = { accountId: "", amount: "", note: "" };
const initialTransfer = { fromAccountId: "", beneficiaryId: "", amount: "", schedule: false };
const initialBeneficiary = { name: "", bank: "", accountNumber: "", ifsc: "" };

function Dashboard() {
  const navigate = useNavigate();
  const { token, user, isAuthed, logout } = useAuth();

  const [profile, setProfile] = useState(user);
  const [status, setStatus] = useState("loading");
  const [summary, setSummary] = useState({ totalBalance: 0, accountCount: 0 });
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [insights, setInsights] = useState([]);
  const [scheduledTransfers, setScheduledTransfers] = useState([]);

  const [depositForm, setDepositForm] = useState(initialDeposit);
  const [transferForm, setTransferForm] = useState(initialTransfer);
  const [beneficiaryForm, setBeneficiaryForm] = useState(initialBeneficiary);
  const [actionStatus, setActionStatus] = useState(null);
  const activePanel = "deposit";

  const canDeposit = accounts.length > 0;
  const canTransfer = accounts.length > 0 && beneficiaries.length > 0;

  const totalSpend = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "transfer")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const [profileData, summaryData, accountData, txData, beneficiaryData] =
          await Promise.all([
            apiRequest("/auth/me", { token }),
            apiRequest("/accounts/summary", { token }),
            apiRequest("/accounts", { token }),
            apiRequest("/transactions/recent", { token }),
            apiRequest("/beneficiaries", { token }),
          ]);

        if (!isMounted) return;
        setProfile(profileData.user);
        setSummary(summaryData);
        setAccounts(accountData.accounts);
        setTransactions(txData.transactions);
        setBeneficiaries(beneficiaryData.beneficiaries);
        setStatus("ready");
      } catch (err) {
        if (isMounted) {
          logout();
          navigate("/login");
        }
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [isAuthed, navigate, token, logout]);

  const refreshAccounts = async () => {
    const [summaryData, accountData] = await Promise.all([
      apiRequest("/accounts/summary", { token }),
      apiRequest("/accounts", { token }),
    ]);
    setSummary(summaryData);
    setAccounts(accountData.accounts);
  };

  const refreshTransactions = async () => {
    const txData = await apiRequest("/transactions/recent", { token });
    setTransactions(txData.transactions);
  };

  const refreshBeneficiaries = async () => {
    const beneficiaryData = await apiRequest("/beneficiaries", { token });
    setBeneficiaries(beneficiaryData.beneficiaries);
  };

  const refreshInsights = async () => {
    const insightData = await apiRequest("/insights", { token });
    setInsights(insightData.insights);
  };

  const refreshSchedule = async () => {
    const scheduleData = await apiRequest("/transfers/scheduled", { token });
    setScheduledTransfers(scheduleData.transfers);
  };

  const handleDepositSubmit = async (event) => {
    event.preventDefault();
    setActionStatus(null);
    try {
      await apiRequest("/accounts/deposit", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...depositForm,
          amount: Number(depositForm.amount),
        }),
      });
      setDepositForm(initialDeposit);
      await Promise.all([refreshAccounts(), refreshTransactions()]);
      setActionStatus({ type: "success", message: "Deposit added successfully." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message || "Deposit failed." });
    }
  };

  const handleTransferSubmit = async (event) => {
    event.preventDefault();
    setActionStatus(null);
    try {
      await apiRequest("/transfers", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...transferForm,
          amount: Number(transferForm.amount),
        }),
      });
      setTransferForm(initialTransfer);
      await Promise.all([refreshAccounts(), refreshTransactions(), refreshSchedule()]);
      setActionStatus({ type: "success", message: "Transfer submitted." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message || "Transfer failed." });
    }
  };

  const handleBeneficiarySubmit = async (event) => {
    event.preventDefault();
    setActionStatus(null);
    try {
      await apiRequest("/beneficiaries", {
        token,
        method: "POST",
        body: JSON.stringify(beneficiaryForm),
      });
      setBeneficiaryForm(initialBeneficiary);
      await refreshBeneficiaries();
      setActionStatus({ type: "success", message: "Beneficiary added." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message || "Add beneficiary failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>Welcome back, {profile?.name || "Member"}.</h2>
          <p>Here is your live snapshot for today.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/beneficiaries" className="btn btn-secondary">
            Add Beneficiary
          </Link>
          <Link to="/transfers" className="btn btn-outline">
            New Transfer
          </Link>
        </div>
      </header>

      {status === "loading" ? (
        <div className="status status-info">Loading your account...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card highlight">
              <h3>Total Balance</h3>
              <strong>${summary.totalBalance.toFixed(2)}</strong>
              <p>Across {summary.accountCount} active accounts.</p>
            </div>
            <div className="dashboard-card">
              <h3>Monthly Spend</h3>
              <strong>${totalSpend.toFixed(2)}</strong>
              <p>Transfers processed this month.</p>
            </div>
            <div className="dashboard-card">
              <h3>Credit Score</h3>
              <strong>752</strong>
              <p>Excellent standing and improving.</p>
            </div>
          </div>

          <div className="dashboard-card quick-links">
            <h3>Quick access</h3>
            <div className="quick-links-grid">
              <Link to="/accounts" className="btn btn-ghost">
                Accounts
              </Link>
              <Link to="/transfers" className="btn btn-ghost">
                Transfers
              </Link>
              <Link to="/beneficiaries" className="btn btn-ghost">
                Beneficiaries
              </Link>
              <Link to="/cards" className="btn btn-ghost">
                Cards
              </Link>
              <Link to="/loans" className="btn btn-ghost">
                Loans
              </Link>
              <Link to="/statements" className="btn btn-ghost">
                Statements
              </Link>
              <Link to="/alerts" className="btn btn-ghost">
                Alerts
              </Link>
              <Link to="/profile" className="btn btn-ghost">
                Profile
              </Link>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Scheduled Payments</h3>
              <p>{scheduledTransfers.length || 0} upcoming</p>
              <Link to="/transfers" className="btn btn-ghost">
                View schedule
              </Link>
              {scheduledTransfers.length > 0 && (
                <ul className="list">
                  {scheduledTransfers.map((transfer) => (
                    <li key={transfer._id}>
                      ${transfer.amount.toFixed(2)} scheduled
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="dashboard-card">
              <h3>Smart Insights</h3>
              <p>Get tailored guidance from your activity.</p>
              <button type="button" className="btn btn-ghost" onClick={refreshInsights}>
                Open insights
              </button>
              {insights.length > 0 && (
                <ul className="list">
                  {insights.map((insight, index) => (
                    <li key={`${insight.title}-${index}`}>
                      <strong>{insight.title}</strong>
                      <span>{insight.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="dashboard-card">
              <h3>Security Center</h3>
              <p>All devices verified. No alerts.</p>
              <Link to="/alerts" className="btn btn-ghost">
                Review devices
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-card">
              <h3>Accounts</h3>
              <div className="table">
                {accounts.map((account) => (
                  <div key={account._id} className="table-row">
                    <span>{account.type}</span>
                    <span>${account.balance.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Link to="/accounts" className="btn btn-secondary">
                Add Funds
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>Recent Activity</h3>
              <div className="table">
                {transactions.map((tx) => (
                  <div key={tx._id} className="table-row">
                    <span>{tx.type}</span>
                    <span>${tx.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Beneficiaries</h3>
              <div className="table">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary._id} className="table-row">
                    <span>{beneficiary.name}</span>
                    <span>{beneficiary.bank}</span>
                  </div>
                ))}
              </div>
              <Link to="/beneficiaries" className="btn btn-ghost">
                Manage beneficiaries
              </Link>
            </div>
          </div>

          <div className="dashboard-forms">
            {actionStatus && (
              <div className={`status status-${actionStatus.type}`}>
                {actionStatus.message}
              </div>
            )}

            {activePanel === "deposit" && (
              <form className="form-grid" onSubmit={handleDepositSubmit}>
                <h3>Add Funds</h3>
                <div className="field">
                  <label htmlFor="depositAccount">Account</label>
                  <select
                    id="depositAccount"
                    value={depositForm.accountId}
                    onChange={(event) =>
                      setDepositForm((prev) => ({
                        ...prev,
                        accountId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.type}
                      </option>
                    ))}
                  </select>
                  {!canDeposit && (
                    <span className="field-hint">
                      No accounts found. Create one in <Link to="/accounts">Accounts</Link>.
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="depositAmount">Amount</label>
                  <input
                    id="depositAmount"
                    type="number"
                    min="1"
                    value={depositForm.amount}
                    onChange={(event) =>
                      setDepositForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="depositNote">Note</label>
                  <input
                    id="depositNote"
                    type="text"
                    value={depositForm.note}
                    onChange={(event) =>
                      setDepositForm((prev) => ({
                        ...prev,
                        note: event.target.value,
                      }))
                    }
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!canDeposit}>
                  Submit Deposit
                </button>
              </form>
            )}

            {activePanel === "transfer" && (
              <form className="form-grid" onSubmit={handleTransferSubmit}>
                <h3>New Transfer</h3>
                <div className="field">
                  <label htmlFor="transferAccount">From Account</label>
                  <select
                    id="transferAccount"
                    value={transferForm.fromAccountId}
                    onChange={(event) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        fromAccountId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.type}
                      </option>
                    ))}
                  </select>
                  {accounts.length === 0 && (
                    <span className="field-hint">
                      No accounts found. Create one in <Link to="/accounts">Accounts</Link>.
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="transferBeneficiary">Beneficiary</label>
                  <select
                    id="transferBeneficiary"
                    value={transferForm.beneficiaryId}
                    onChange={(event) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        beneficiaryId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select beneficiary</option>
                    {beneficiaries.map((beneficiary) => (
                      <option key={beneficiary._id} value={beneficiary._id}>
                        {beneficiary.name} ({beneficiary.bank})
                      </option>
                    ))}
                  </select>
                  {beneficiaries.length === 0 && (
                    <span className="field-hint">
                      No beneficiaries found. Add one in{" "}
                      <Link to="/beneficiaries">Beneficiaries</Link>.
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="transferAmount">Amount</label>
                  <input
                    id="transferAmount"
                    type="number"
                    min="1"
                    value={transferForm.amount}
                    onChange={(event) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={transferForm.schedule}
                    onChange={(event) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        schedule: event.target.checked,
                      }))
                    }
                  />
                  Schedule for later
                </label>
                <button type="submit" className="btn btn-primary" disabled={!canTransfer}>
                  Submit Transfer
                </button>
              </form>
            )}

            {activePanel === "beneficiary" && (
              <form className="form-grid" onSubmit={handleBeneficiarySubmit}>
                <h3>Add Beneficiary</h3>
                <div className="field">
                  <label htmlFor="beneficiaryName">Full Name</label>
                  <input
                    id="beneficiaryName"
                    type="text"
                    value={beneficiaryForm.name}
                    onChange={(event) =>
                      setBeneficiaryForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="beneficiaryBank">Bank</label>
                  <input
                    id="beneficiaryBank"
                    type="text"
                    value={beneficiaryForm.bank}
                    onChange={(event) =>
                      setBeneficiaryForm((prev) => ({
                        ...prev,
                        bank: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="beneficiaryAccount">Account Number</label>
                  <input
                    id="beneficiaryAccount"
                    type="text"
                    value={beneficiaryForm.accountNumber}
                    onChange={(event) =>
                      setBeneficiaryForm((prev) => ({
                        ...prev,
                        accountNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="beneficiaryIfsc">IFSC</label>
                  <input
                    id="beneficiaryIfsc"
                    type="text"
                    value={beneficiaryForm.ifsc}
                    onChange={(event) =>
                      setBeneficiaryForm((prev) => ({
                        ...prev,
                        ifsc: event.target.value,
                      }))
                    }
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Beneficiary
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
