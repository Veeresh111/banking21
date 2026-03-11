import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Hero() {
  const [preview, setPreview] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("idle");

  const handlePreviewDeposit = async () => {
    setPreviewStatus("loading");
    try {
      const data = await apiRequest("/demo/deposit", { method: "POST" });
      setPreview({ type: "deposit", data });
      setPreviewStatus("ready");
    } catch (err) {
      setPreview({ type: "error", message: err.message || "Preview failed." });
      setPreviewStatus("error");
    }
  };

  const handlePreviewInsights = async () => {
    setPreviewStatus("loading");
    try {
      const data = await apiRequest("/insights/public");
      setPreview({ type: "insights", data });
      setPreviewStatus("ready");
    } catch (err) {
      setPreview({ type: "error", message: err.message || "Preview failed." });
      setPreviewStatus("error");
    }
  };

  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-content">
          <span className="eyebrow">Digital Banking, Reimagined</span>
          <h1>Banking that feels calm, fast, and secure.</h1>
          <p>
            SmartBank is your complete financial hub: open accounts, move money,
            and manage cards in minutes. Built for clarity, security, and daily
            confidence.
          </p>

          <div className="cta-row">
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>

          <div className="hero-metrics">
            <div className="metric">
              <span className="metric-value">2 min</span>
              <span className="metric-label">average onboarding</span>
            </div>
            <div className="metric">
              <span className="metric-value">24/7</span>
              <span className="metric-label">fraud monitoring</span>
            </div>
            <div className="metric">
              <span className="metric-value">98%</span>
              <span className="metric-label">instant approvals</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div>
                <h3>Account Overview</h3>
                <p>SmartBank Platinum</p>
              </div>
              <span className="pill">Live</span>
            </div>
            <div className="hero-card-balance">
              <span>Available Balance</span>
              <strong>$18,460.45</strong>
            </div>
            <div className="hero-card-list">
              <div className="hero-card-item">
                <span>Weekly Deposits</span>
                <strong>$3,240</strong>
              </div>
              <div className="hero-card-item">
                <span>Payments Processed</span>
                <strong>42</strong>
              </div>
              <div className="hero-card-item">
                <span>Credit Utilization</span>
                <strong>28%</strong>
              </div>
            </div>
            <div className="hero-card-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePreviewDeposit}
              >
                Add Funds
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handlePreviewInsights}
              >
                View Insights
              </button>
            </div>
            {previewStatus === "loading" && (
              <div className="status status-info">Loading preview...</div>
            )}
            {preview?.type === "deposit" && (
              <div className="status status-success">
                {preview.data.msg} New balance: ${preview.data.balance.toFixed(2)}
              </div>
            )}
            {preview?.type === "insights" && (
              <div className="status status-success">
                {preview.data.insights[0]?.title}
              </div>
            )}
            {preview?.type === "error" && (
              <div className="status status-error">{preview.message}</div>
            )}
          </div>
        </div>
      </div>

      <section className="features">
        <div className="section-head">
          <h2>Applications built for every money moment</h2>
          <p>
            From savings to lending, SmartBank connects all your financial
            products in one secure place.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Smart Savings</h3>
            <p>Automate goals, set rules, and track progress in real time.</p>
          </article>
          <article className="feature-card">
            <h3>Instant Payments</h3>
            <p>Send and receive money globally with transparent exchange rates.</p>
          </article>
          <article className="feature-card">
            <h3>Credit Studio</h3>
            <p>Manage limits, freeze cards, and monitor spending instantly.</p>
          </article>
          <article className="feature-card">
            <h3>Loan Hub</h3>
            <p>Apply for personal or business loans with smart approvals.</p>
          </article>
          <article className="feature-card">
            <h3>Wealth Builder</h3>
            <p>Invest in curated portfolios with guided risk profiles.</p>
          </article>
          <article className="feature-card">
            <h3>Business Accounts</h3>
            <p>Multi-user access, invoicing, and cash-flow insights.</p>
          </article>
        </div>
      </section>
    </section>
  );
}

export default Hero;
