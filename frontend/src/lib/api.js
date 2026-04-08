export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Request failed. Please retry.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
};

export const withAuth = (token, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return { ...options, headers };
};
