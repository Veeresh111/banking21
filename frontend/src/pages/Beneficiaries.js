import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { name: "", bank: "", accountNumber: "", ifsc: "" };

function Beneficiaries() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);

  const loadBeneficiaries = useCallback(async () => {
    const data = await apiRequest("/beneficiaries", { token });
    setBeneficiaries(data.beneficiaries);
  }, [token]);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadBeneficiaries().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, logout, loadBeneficiaries]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      if (editingId) {
        await apiRequest(`/beneficiaries/${editingId}`, {
          token,
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setStatus({ type: "success", message: "Beneficiary updated." });
      } else {
        await apiRequest("/beneficiaries", {
          token,
          method: "POST",
          body: JSON.stringify(form),
        });
        setStatus({ type: "success", message: "Beneficiary added." });
      }

      setForm(initialForm);
      setEditingId(null);
      await loadBeneficiaries();
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Save failed." });
    }
  };

  const handleEdit = (beneficiary) => {
    setEditingId(beneficiary._id);
    setForm({
      name: beneficiary.name,
      bank: beneficiary.bank,
      accountNumber: beneficiary.accountNumber,
      ifsc: beneficiary.ifsc,
    });
  };

  const handleDelete = async (id) => {
    setStatus(null);
    try {
      await apiRequest(`/beneficiaries/${id}`, {
        token,
        method: "DELETE",
      });
      await loadBeneficiaries();
      setStatus({ type: "success", message: "Beneficiary removed." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Delete failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Beneficiaries</span>
          <h2>Manage beneficiaries</h2>
          <p>Add, update, or remove trusted recipients.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Saved beneficiaries</h3>
          <div className="table">
            {beneficiaries.length === 0 ? (
              <div className="empty-state">No beneficiaries added yet.</div>
            ) : (
              beneficiaries.map((beneficiary) => (
                <div key={beneficiary._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{beneficiary.name}</strong>
                    <span>
                      {beneficiary.bank} • {beneficiary.accountNumber}
                    </span>
                  </div>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleEdit(beneficiary)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleDelete(beneficiary._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>{editingId ? "Update beneficiary" : "Add new beneficiary"}</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="beneficiaryName">Full Name</label>
              <input
                id="beneficiaryName"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="beneficiaryBank">Bank</label>
              <input
                id="beneficiaryBank"
                type="text"
                value={form.bank}
                onChange={(event) => setForm((prev) => ({ ...prev, bank: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="beneficiaryAccount">Account Number</label>
              <input
                id="beneficiaryAccount"
                type="text"
                value={form.accountNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, accountNumber: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="beneficiaryIfsc">IFSC</label>
              <input
                id="beneficiaryIfsc"
                type="text"
                value={form.ifsc}
                onChange={(event) => setForm((prev) => ({ ...prev, ifsc: event.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Beneficiary" : "Add Beneficiary"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Beneficiaries;
