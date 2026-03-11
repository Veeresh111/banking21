import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { fromAccountId: "", beneficiaryId: "", amount: "", schedule: false };

function Transfers() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const loadData = async () => {
    const [accountData, beneficiaryData, transferData] = await Promise.all([
      apiRequest("/accounts", { token }),
      apiRequest("/beneficiaries", { token }),
      apiRequest("/transfers", { token }),
    ]);
    setAccounts(accountData.accounts);
    setBeneficiaries(beneficiaryData.beneficiaries);
    setTransfers(transferData.transfers);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadData().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, token, logout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/transfers", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      setForm(initialForm);
      await loadData();
      setStatus({ type: "success", message: "Transfer submitted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Transfer failed." });
    }
  };

  const handleCancel = async (id) => {
    setStatus(null);
    try {
      await apiRequest(`/transfers/${id}/cancel`, {
        token,
        method: "PATCH",
      });
      await loadData();
      setStatus({ type: "success", message: "Transfer canceled." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Cancel failed." });
    }
  };

  if (!isAuthed) return null;

  const canTransfer = accounts.length > 0 && beneficiaries.length > 0;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Transfers</span>
          <h2>Send money securely</h2>
          <p>Create new transfers and manage scheduled payments.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>New transfer</h3>
          {!canTransfer && (
            <div className="status status-info">
              {accounts.length === 0 && "Create an account before sending money. "}
              {beneficiaries.length === 0 && "Add a beneficiary to send money."}
            </div>
          )}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="transferAccount">From account</label>
              <select
                id="transferAccount"
                value={form.fromAccountId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fromAccountId: event.target.value }))
                }
                required
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.type} (${account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <span className="field-hint">
                  No accounts found. <Link to="/accounts">Create one</Link>.
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="transferBeneficiary">Beneficiary</label>
              <select
                id="transferBeneficiary"
                value={form.beneficiaryId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, beneficiaryId: event.target.value }))
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
                  No beneficiaries found. <Link to="/beneficiaries">Add one</Link>.
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="transferAmount">Amount</label>
              <input
                id="transferAmount"
                type="number"
                min="1"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.schedule}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, schedule: event.target.checked }))
                }
              />
              Schedule for later
            </label>
            <button type="submit" className="btn btn-primary" disabled={!canTransfer}>
              Submit Transfer
            </button>
          </form>
        </div>

        <div className="page-card">
          <h3>Transfer history</h3>
          <div className="table">
            {transfers.length === 0 ? (
              <div className="empty-state">No transfers yet.</div>
            ) : (
              transfers.map((transfer) => (
                <div key={transfer._id} className="table-row table-row-vertical">
                  <div>
                    <strong>${transfer.amount.toFixed(2)}</strong>
                    <span>Status: {transfer.status}</span>
                  </div>
                  {transfer.status === "scheduled" && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleCancel(transfer._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Transfers;
