export const API_BASE = "https://saathiai.org/api";

export function buildUrl(endpoint: string) {
  if (endpoint.startsWith('/api')) return `https://saathiai.org${endpoint}`;
  return `${API_BASE}${endpoint}`;
}

export const safeFetch = async (endpoint: string, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(buildUrl(endpoint), {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      // @ts-ignore
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("API error");

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.log("API ERROR:", error);
    return null;
  }
};
