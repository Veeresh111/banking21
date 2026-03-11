import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthed, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="presentation">
              <defs>
                <linearGradient id="sb-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0c7c6c" />
                  <stop offset="100%" stopColor="#c6842f" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="22" fill="url(#sb-grad)" />
              <path
                d="M13 26c6-6 12-6 18 0 2 2 4 3 6 3"
                stroke="#fffaf3"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M13 18c6 6 12 6 18 0 2-2 4-3 6-3"
                stroke="#fffaf3"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
            </svg>
          </span>
          <span className="brand-name">SmartBank</span>
          <span className="brand-tag">Private Banking</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {!isAuthed && (
            <>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
            </>
          )}
          {isAuthed && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/accounts" className={navLinkClass}>
                Accounts
              </NavLink>
              <NavLink to="/transfers" className={navLinkClass}>
                Transfers
              </NavLink>
              <NavLink to="/transactions" className={navLinkClass}>
                Transactions
              </NavLink>
              <NavLink to="/beneficiaries" className={navLinkClass}>
                Beneficiaries
              </NavLink>
              <NavLink to="/cards" className={navLinkClass}>
                Cards
              </NavLink>
              <NavLink to="/loans" className={navLinkClass}>
                Loans
              </NavLink>
              <NavLink to="/statements" className={navLinkClass}>
                Statements
              </NavLink>
              <NavLink to="/alerts" className={navLinkClass}>
                Alerts
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthed ? (
            <>
              <span className="nav-user">Hi, {user?.name || "Member"}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/register" className="btn btn-primary">
              Open Account
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
