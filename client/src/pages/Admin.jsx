import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Admin() {
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function loadAll() {
    setErr(""); setOk("");
    try {
      const c = await api("/api/admin/categories");
      setCategories(c?.categories || []);

      const e = await api("/api/admin/events");
      setEvents(e?.events || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function createCategory(e) {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: catName, slug: catSlug || undefined }),
      });
      setOk("Kategorija sukurta");
      setCatName(""); setCatSlug("");
      loadAll();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function setStatus(id, status) {
    setErr(""); setOk("");
    try {
      await api(`/api/admin/events/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOk(`Atnaujinta: event ${id} -> ${status}`);
      loadAll();
    } catch (e) {
      setErr(e.message);
    }
  }

  const pending = events.filter((ev) => ev.status === "PENDING");

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Admin</h1>
        <button className="btn btn-ghost" onClick={loadAll}>Atnaujinti</button>
      </div>

      {err && <div className="alert">{err}</div>}
      {ok && <div className="ok">{ok}</div>}

      <div className="grid-2">
        <div className="card">
          <h2>Kategorijos</h2>

          <form onSubmit={createCategory} className="form">
            <label>
              name
              <input value={catName} onChange={(e) => setCatName(e.target.value)} />
            </label>
            <label>
              slug (nebūtina)
              <input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
            </label>
            <button className="btn">Pridėti</button>
          </form>

          <div className="list">
            {categories.map((c) => (
              <div className="list-row" key={c.id}>
                <b>{c.name}</b>
                <span className="muted">{c.slug}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Pending renginiai</h2>

          {pending.length === 0 && <div className="muted">Nėra pending.</div>}

          <div className="list">
            {pending.map((ev) => (
              <div className="card" key={ev.id}>
                <div className="row">
                  <b>{ev.title}</b>
                  <span className="pill">{ev.status}</span>
                </div>
                <div className="muted">{ev.location}</div>
                <div className="muted">{new Date(ev.startsAt).toLocaleString()}</div>
                <div className="muted">categoryId: {ev.categoryId}</div>

                <div className="row gap">
                  <button className="btn" onClick={() => setStatus(ev.id, "APPROVED")}>Approve</button>
                  <button className="btn btn-ghost" onClick={() => setStatus(ev.id, "REJECTED")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
