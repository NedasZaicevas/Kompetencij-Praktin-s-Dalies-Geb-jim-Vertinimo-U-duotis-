import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, isAuthed, isAdmin, logout } from "../auth.js";

export default function Nav() {
  const nav = useNavigate();
  const authed = isAuthed();
  const admin = isAdmin();
  const user = getUser();

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/">Renginiai</Link>

        <nav className="links">
          <Link to="/">Renginiai</Link>
          {authed && <Link to="/create">Sukurti renginį</Link>}
          {admin && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="right">
          {authed ? (
            <>
              <span className="pill">
                {user?.email || "Prisijungęs"} {admin ? "• ADMIN" : ""}
              </span>
              <button className="btn btn-ghost" onClick={onLogout}>Atsijungti</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Login</Link>
              <Link className="btn" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
