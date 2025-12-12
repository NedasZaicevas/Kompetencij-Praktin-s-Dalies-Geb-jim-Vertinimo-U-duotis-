import React, { useState } from "react";
import { api } from "../api.js";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("test@t.lt");
  const [password, setPassword] = useState("test123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Prisijungimas</h2>
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
          {loading ? "Jungiam..." : "Prisijungti"}
        </button>

        <div className="muted">
          Neturi paskyros? <Link to="/register">Registruotis</Link>
        </div>
      </form>
    </div>
  );
}
