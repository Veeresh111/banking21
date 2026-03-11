export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const { token, headers, ...rest } = options;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.msg || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
