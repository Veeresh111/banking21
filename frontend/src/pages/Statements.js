import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { month: "", year: "" };

function Statements() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [statements, setStatements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const loadStatements = async () => {
    const data = await apiRequest("/statements", { token });
    setStatements(data.statements);
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadStatements().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, token, logout]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/statements/generate", {
        token,
        method: "POST",
        body: JSON.stringify({
          month: Number(form.month),
          year: Number(form.year),
        }),
      });
      setForm(initialForm);
      await loadStatements();
      setStatus({ type: "success", message: "Statement generated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Generation failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Statements</span>
          <h2>Generate account statements</h2>
          <p>Create and view monthly summaries.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Statement history</h3>
          <div className="table">
            {statements.length === 0 ? (
              <div className="empty-state">No statements generated yet.</div>
            ) : (
              statements.map((statement) => (
                <div key={statement._id} className="table-row table-row-vertical">
                  <div>
                    <strong>
                      {statement.month}/{statement.year}
                    </strong>
                    <span>{statement.summary}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>Generate statement</h3>
          <form className="form-grid" onSubmit={handleGenerate}>
            <div className="field">
              <label htmlFor="statementMonth">Month (1-12)</label>
              <input
                id="statementMonth"
                type="number"
                min="1"
                max="12"
                value={form.month}
                onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="statementYear">Year</label>
              <input
                id="statementYear"
                type="number"
                min="2000"
                value={form.year}
                onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Generate Statement
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Statements;
