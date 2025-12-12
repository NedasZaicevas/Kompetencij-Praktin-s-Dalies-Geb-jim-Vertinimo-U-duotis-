import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // tavo /api/categories tikriausiai grąžina {categories:[...]}
        const data = await api("/api/categories");
        const list = Array.isArray(data) ? data : (data?.categories || []);
        setCategories(list);
        if (list[0]?.id) setCategoryId(String(list[0].id));
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk(""); setLoading(true);
    try {
      await api("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title,
          location,
          startsAt, // ISO arba datetime-local string - backendas daro new Date()
          categoryId: Number(categoryId),
          imageUrl: imageUrl || null,
        }),
      });
      setOk("Pateikta! (USER sukurti renginiai būna PENDING, adminas turi patvirtinti)");
      setTitle(""); setLocation(""); setStartsAt(""); setImageUrl("");
      setTimeout(() => nav("/"), 800);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Sukurti renginį</h2>

      <form onSubmit={submit} className="form">
        <label>
          Pavadinimas
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Vieta
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>

        <label>
          Data/Laikas
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </label>

        <label>
          Kategorija
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          imageUrl (nebūtina)
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>

        {err && <div className="alert">{err}</div>}
        {ok && <div className="ok">{ok}</div>}

        <button className="btn" disabled={loading}>
          {loading ? "Siunčiam..." : "Sukurti"}
        </button>
      </form>
    </div>
  );
}
