const API_BASE = import.meta.env.VITE_SAMURAI_API ?? 'http://localhost:4000';

export async function fetchTraces(project) {
  const url = new URL(`${API_BASE}/api/traces`);
  if (project) url.searchParams.set('project', project);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch traces: ${res.status}`);
  return res.json();
}

export async function fetchSummary(project) {
  const url = new URL(`${API_BASE}/api/traces/summary`);
  if (project) url.searchParams.set('project', project);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  return res.json();
}
