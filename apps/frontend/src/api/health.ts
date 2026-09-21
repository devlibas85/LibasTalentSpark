const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const getHealth = async (): Promise<unknown> => {
  if (!API_BASE) return null;
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
};
