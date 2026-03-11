import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Transactions() {
  const navigate = useNavigate();
  const { token, isAuthed, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);

  const loadTransactions = useCallback(async () => {
    const data = await apiRequest("/transactions", { token });
    setTransactions(data.transactions);
  }, [token]);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadTransactions().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, logout, loadTransactions]);

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Transactions</span>
          <h2>All transactions</h2>
          <p>Review every transaction across your accounts.</p>
        </div>
      </header>

      <div className="page-grid">
        <div className="page-card">
          <h3>Transaction list</h3>
          <div className="table">
            {transactions.length === 0 ? (
              <div className="empty-state">No transactions yet.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="table-row table-row-vertical">
                  <div>
                    <strong>{tx.type.toUpperCase()}</strong>
                    <span>${tx.amount.toFixed(2)}</span>
                  </div>
                  <span>{tx.description || "Activity"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Transactions;
