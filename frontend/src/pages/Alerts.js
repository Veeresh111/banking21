import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { type: "system", message: "" };

function Alerts() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const loadAlerts = async () => {
    const data = await apiRequest("/alerts", { token });
    setAlerts(data.alerts);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadAlerts().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, token, logout]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/alerts", {
        token,
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(initialForm);
      await loadAlerts();
      setStatus({ type: "success", message: "Alert created." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Create failed." });
    }
  };

  const handleRead = async (id) => {
    setStatus(null);
    try {
      await apiRequest(`/alerts/${id}/read`, { token, method: "PATCH" });
      await loadAlerts();
      setStatus({ type: "success", message: "Alert marked read." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Update failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Alerts</span>
          <h2>Manage alerts</h2>
          <p>Create and acknowledge system alerts.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Alerts feed</h3>
          <div className="table">
            {alerts.length === 0 ? (
              <div className="empty-state">No alerts yet.</div>
            ) : (
              alerts.map((alert) => (
                <div key={alert._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{alert.type.toUpperCase()}</strong>
                    <span>{alert.message}</span>
                  </div>
                  <div className="row-actions">
                    <span>{alert.read ? "Read" : "Unread"}</span>
                    {!alert.read && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleRead(alert._id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>Create alert</h3>
          <form className="form-grid" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="alertType">Type</label>
              <select
                id="alertType"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                required
              >
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="transaction">Transaction</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="alertMessage">Message</label>
              <input
                id="alertMessage"
                type="text"
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Alert
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Alerts;
