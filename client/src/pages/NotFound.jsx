import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card">
      <h2>404</h2>
      <p className="muted">Tokio puslapio nėra.</p>
      <Link className="btn" to="/">Atgal į renginius</Link>
    </div>
  );
}