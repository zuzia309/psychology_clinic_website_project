async function request(url, options = {}) {
  const res = await fetch(url, options);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

window.api = {
  get: (url) => request(url),

  post: (url, body) =>
    request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  patch: (url, body) =>
    request(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  del: (url) =>
    request(url, {
      method: "DELETE",
    }),
};