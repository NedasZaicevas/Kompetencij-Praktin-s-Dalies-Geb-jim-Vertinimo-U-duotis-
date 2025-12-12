import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { isAdmin } from "../auth.js";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      // Viešai: /api/events (grąžina masyvą)
      // Adminui galima rodyti ir admin list, bet paliekam paprastai
      const data = await api("/api/events");
      setEvents(Array.isArray(data) ? data : (data?.events || []));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Renginiai</h1>
        <button className="btn btn-ghost" onClick={load}>Atnaujinti</button>
      </div>

      {isAdmin() && (
        <div className="note">
          Tu esi ADMIN — gali patvirtinti renginius per <b>Admin</b> puslapį.
        </div>
      )}

      {loading && <div className="muted">Kraunama...</div>}
      {err && <div className="alert">{err}</div>}

      <div className="grid">
        {events.map((ev) => (
          <div className="card" key={ev.id}>
            <div className="row">
              <h3 className="m0">{ev.title}</h3>
              <span className="pill">{ev.category?.name || `catId:${ev.categoryId}`}</span>
            </div>
            <div className="muted">{ev.location}</div>
            <div className="muted">
              {ev.startsAt ? new Date(ev.startsAt).toLocaleString() : ""}
            </div>
            {ev.imageUrl && (
              <div className="muted">Image: {ev.imageUrl}</div>
            )}
          </div>
        ))}
      </div>

      {!loading && !err && events.length === 0 && (
        <div className="muted">Kol kas renginių nėra.</div>
      )}
    </div>
  );
}
