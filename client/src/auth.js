export function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

export function isAuthed() {
  return !!localStorage.getItem("token");
}

export function isAdmin() {
  const u = getUser();
  return u?.role === "ADMIN";
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
