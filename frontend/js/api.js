const API_BASE = "http://localhost:4000/api";

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erreur API");
  }
  return data;
};

const setSession = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getSessionUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export { apiFetch, setSession, clearSession, getSessionUser, API_BASE };
