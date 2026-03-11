import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { type: "Checking", nickname: "", initialDeposit: "" };

function Accounts() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [nicknameEdits, setNicknameEdits] = useState({});
  const [status, setStatus] = useState(null);

  const loadAccounts = async () => {
    const data = await apiRequest("/accounts", { token });
    setAccounts(data.accounts);
    const editState = {};
    data.accounts.forEach((account) => {
      editState[account._id] = account.nickname || "";
    });
    setNicknameEdits(editState);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadAccounts().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, token, logout]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/accounts", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...form,
          initialDeposit: Number(form.initialDeposit) || 0,
        }),
      });
      setForm(initialForm);
      await loadAccounts();
      setStatus({ type: "success", message: "Account created." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Account creation failed." });
    }
  };

  const handleUpdate = async (accountId) => {
    setStatus(null);
    try {
      await apiRequest(`/accounts/${accountId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({
          nickname: nicknameEdits[accountId] || "",
        }),
      });
      await loadAccounts();
      setStatus({ type: "success", message: "Account updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Update failed." });
    }
  };

  const handleClose = async (accountId) => {
    setStatus(null);
    try {
      await apiRequest(`/accounts/${accountId}`, {
        token,
        method: "DELETE",
      });
      await loadAccounts();
      setStatus({ type: "success", message: "Account closed." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Close failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Accounts</span>
          <h2>Manage your accounts</h2>
          <p>Create, rename, and close accounts connected to your profile.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Accounts List</h3>
          <div className="table">
            {accounts.length === 0 ? (
              <div className="empty-state">No accounts yet.</div>
            ) : (
              accounts.map((account) => (
                <div key={account._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{account.type}</strong>
                    <span>
                      Balance: ${account.balance.toFixed(2)}{" "}
                      {account.nickname ? `• ${account.nickname}` : ""}
                    </span>
                  </div>
                  <div className="row-actions">
                    <input
                      type="text"
                      value={nicknameEdits[account._id] || ""}
                      onChange={(event) =>
                        setNicknameEdits((prev) => ({
                          ...prev,
                          [account._id]: event.target.value,
                        }))
                      }
                      placeholder="Nickname"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleUpdate(account._id)}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleClose(account._id)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>Open a new account</h3>
          <form className="form-grid" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="accountType">Account Type</label>
              <select
                id="accountType"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                required
              >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="accountNickname">Nickname</label>
              <input
                id="accountNickname"
                type="text"
                value={form.nickname}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nickname: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="initialDeposit">Initial Deposit</label>
              <input
                id="initialDeposit"
                type="number"
                min="0"
                value={form.initialDeposit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, initialDeposit: event.target.value }))
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Accounts;
