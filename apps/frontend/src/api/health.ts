const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);

  return res.json();
};


