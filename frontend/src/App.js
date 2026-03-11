import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import Hero from "./pages/Hero";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transfers from "./pages/Transfers";
import Beneficiaries from "./pages/Beneficiaries";
import Cards from "./pages/Cards";
import Loans from "./pages/Loans";
import Transactions from "./pages/Transactions";
import Statements from "./pages/Statements";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />

          <main className="app-main">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/beneficiaries" element={<Beneficiaries />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/statements" element={<Statements />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
