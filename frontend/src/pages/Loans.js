import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { type: "personal", amount: "", termMonths: "", rate: "" };

function Loans() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const loadLoans = async () => {
    const data = await apiRequest("/loans", { token });
    setLoans(data.loans);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadLoans().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, token, logout]);

  const handleApply = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/loans", {
        token,
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          termMonths: Number(form.termMonths),
          rate: Number(form.rate),
        }),
      });
      setForm(initialForm);
      await loadLoans();
      setStatus({ type: "success", message: "Loan application submitted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Application failed." });
    }
  };

  const handleStatusUpdate = async (loanId, newStatus) => {
    setStatus(null);
    try {
      await apiRequest(`/loans/${loanId}/status`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadLoans();
      setStatus({ type: "success", message: "Loan status updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Status update failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Loans</span>
          <h2>Apply and track loans</h2>
          <p>Submit new applications and monitor approvals.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Loan applications</h3>
          <div className="table">
            {loans.length === 0 ? (
              <div className="empty-state">No loan applications yet.</div>
            ) : (
              loans.map((loan) => (
                <div key={loan._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{loan.type} • ${loan.amount.toFixed(2)}</strong>
                    <span>
                      {loan.termMonths} months @ {loan.rate}% • {loan.status}
                    </span>
                  </div>
                  <div className="row-actions">
                    <select
                      value={loan.status}
                      onChange={(event) => handleStatusUpdate(loan._id, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>New loan request</h3>
          <form className="form-grid" onSubmit={handleApply}>
            <div className="field">
              <label htmlFor="loanType">Loan type</label>
              <select
                id="loanType"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                required
              >
                <option value="personal">Personal</option>
                <option value="home">Home</option>
                <option value="auto">Auto</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="loanAmount">Amount</label>
              <input
                id="loanAmount"
                type="number"
                min="100"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="loanTerm">Term (months)</label>
              <input
                id="loanTerm"
                type="number"
                min="3"
                value={form.termMonths}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, termMonths: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="loanRate">Interest rate (%)</label>
              <input
                id="loanRate"
                type="number"
                min="1"
                max="40"
                value={form.rate}
                onChange={(event) => setForm((prev) => ({ ...prev, rate: event.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Loans;
