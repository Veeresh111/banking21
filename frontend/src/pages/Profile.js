import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { name: "", mobile: "" };

function Profile() {
  const navigate = useNavigate();
  const { token, isAuthed, logout, login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const loadProfile = useCallback(async () => {
    const data = await apiRequest("/auth/me", { token });
    setForm({ name: data.user.name || "", mobile: data.user.mobile || "" });
  }, [token]);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    loadProfile().catch(() => {
      logout();
      navigate("/login");
    });
  }, [isAuthed, navigate, logout, loadProfile]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      const data = await apiRequest("/auth/profile", {
        token,
        method: "PATCH",
        body: JSON.stringify(form),
      });
      login(token, data.user);
      setStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Update failed." });
    }
  };

  if (!isAuthed) return null;

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h2>Your profile</h2>
          <p>Update personal details and contact info.</p>
        </div>
      </header>

      {status && <div className={`status status-${status.type}`}>{status.message}</div>}

      <div className="page-grid">
        <div className="page-card">
          <h3>Profile details</h3>
          <form className="form-grid" onSubmit={handleUpdate}>
            <div className="field">
              <label htmlFor="profileName">Full Name</label>
              <input
                id="profileName"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="profileMobile">Mobile</label>
              <input
                id="profileMobile"
                type="tel"
                value={form.mobile}
                onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Profile;
