import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Events from "./pages/Events.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";
import { isAuthed, isAdmin } from "./auth.js";

function RequireAuth({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}
function RequireAdmin({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreateEvent />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}
