import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (values) => {
    const nextErrors = {};
    if (!emailRegex.test(values.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (values.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Passwords must match";
    }
    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Password reset successful. Please log in." });
      setForm(initialForm);
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Reset failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-card">
        <header className="form-header">
          <h2>Reset password</h2>
          <p>Set a new password to access your account.</p>
        </header>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@smartbank.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {status && (
            <div className={`status status-${status.type}`}>{status.message}</div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="form-footer">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;
