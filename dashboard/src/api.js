const API_BASE = import.meta.env.VITE_SAMURAI_API ?? 'http://localhost:4000';

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function fetchTraces({ project, status, model, search, range, page = 1, pageSize = 25 } = {}) {
  const params = new URLSearchParams();
  if (project) params.set('project', project);
  if (status) params.set('status', status);
  if (model) params.set('model', model);
  if (search) params.set('search', search);
  if (range) params.set('range', range);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return get(`/api/traces?${params}`);
}

export function fetchChartData({ project, range } = {}) {
  const params = new URLSearchParams();
  if (project) params.set('project', project);
  if (range) params.set('range', range);
  return get(`/api/traces/chart-data?${params}`);
}

export function fetchTraceDetail(id) {
  return get(`/api/traces/${id}`);
}

export function fetchSummary(project) {
  const params = project ? `?project=${encodeURIComponent(project)}` : '';
  return get(`/api/traces/summary${params}`);
}

export function fetchModelBreakdown(project) {
  const params = project ? `?project=${encodeURIComponent(project)}` : '';
  return get(`/api/traces/model-breakdown${params}`);
}
