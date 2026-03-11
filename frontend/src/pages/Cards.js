import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { type: "debit", limit: 2000 };

function Cards() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [limitEdits, setLimitEdits] = useState({});
  const [status, setStatus] = useState(null);

  const loadCards = useCallback(async () => {
    const data = await apiRequest("/cards", { token });
    setCards(data.cards);
    const editState = {};
    data.cards.forEach((card) => {
      editState[card._id] = card.limit;
    });
    setLimitEdits(editState);
  }, [token]);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadCards().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, logout, loadCards]);

  const handleIssue = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await apiRequest("/cards", {
        token,
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(initialForm);
      await loadCards();
      setStatus({ type: "success", message: "Card issued." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Issue failed." });
    }
  };

  const handleLimitUpdate = async (cardId) => {
    setStatus(null);
    try {
      await apiRequest(`/cards/${cardId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ limit: limitEdits[cardId] }),
      });
      await loadCards();
      setStatus({ type: "success", message: "Limit updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Update failed." });
    }
  };

  const handleFreeze = async (cardId, action) => {
    setStatus(null);
    try {
      await apiRequest(`/cards/${cardId}/${action}`, {
        token,
        method: "POST",
      });
      await loadCards();
      setStatus({
        type: "success",
        message: action === "freeze" ? "Card frozen." : "Card unfrozen.",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Action failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Cards</span>
          <h2>Manage your cards</h2>
          <p>Issue, freeze, and update limits for your cards.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Your cards</h3>
          <div className="table">
            {cards.length === 0 ? (
              <div className="empty-state">No cards issued yet.</div>
            ) : (
              cards.map((card) => (
                <div key={card._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{card.type.toUpperCase()} • {card.last4}</strong>
                    <span>Status: {card.status}</span>
                  </div>
                  <div className="row-actions">
                    <input
                      type="number"
                      min="0"
                      value={limitEdits[card._id] || 0}
                      onChange={(event) =>
                        setLimitEdits((prev) => ({
                          ...prev,
                          [card._id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleLimitUpdate(card._id)}
                    >
                      Update limit
                    </button>
                    {card.status === "active" ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleFreeze(card._id, "freeze")}
                      >
                        Freeze
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleFreeze(card._id, "unfreeze")}
                      >
                        Unfreeze
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>Issue new card</h3>
          <form className="form-grid" onSubmit={handleIssue}>
            <div className="field">
              <label htmlFor="cardType">Card type</label>
              <select
                id="cardType"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                required
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="cardLimit">Limit</label>
              <input
                id="cardLimit"
                type="number"
                min="0"
                value={form.limit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, limit: event.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Issue Card
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Cards;
