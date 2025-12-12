import React, { useState } from "react";
import { api } from "../api.js";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      nav("/login");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Registracija</h2>
      <form onSubmit={submit} className="form">
        <label>
          El. paštas
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Slaptažodis
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {err && <div className="alert">{err}</div>}

        <button className="btn" disabled={loading}>
          {loading ? "Kuriam..." : "Sukurti paskyrą"}
        </button>

        <div className="muted">
          Jau turi paskyrą? <Link to="/login">Prisijungti</Link>
        </div>
      </form>
    </div>
  );
}
