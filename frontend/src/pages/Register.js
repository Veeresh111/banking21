import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (values) => {
    const nextErrors = {};
    const cleanedMobile = values.mobile.replace(/\D/g, "");

    if (!values.name.trim()) nextErrors.name = "Full name is required";
    if (!emailRegex.test(values.email))
      nextErrors.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(cleanedMobile))
      nextErrors.mobile = "Mobile number must be 10 digits";
    if (values.password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";
    if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = "Passwords must match";

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
      const cleanedMobile = form.mobile.replace(/\D/g, "");
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          mobile: cleanedMobile,
        }),
      });
      setStatus({ type: "success", message: "Registration successful. Log in to continue." });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Registration failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-card">
        <header className="form-header">
          <h2>Create your SmartBank account</h2>
          <p>Start banking in minutes with secure verification.</p>
        </header>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength="10"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10 digit number"
            />
            {errors.mobile && <span className="field-error">{errors.mobile}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
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
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
