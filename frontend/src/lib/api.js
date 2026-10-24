export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const apiRequest = async (path, options = {}) => {
  const endpoint = `${API_BASE}/${path.replace(/^\/+/, "")}`;
  let response;

  try {
    response = await fetch(endpoint, options);
  } catch (cause) {
    const error = new Error(
      `Unable to reach the API server at ${API_BASE}. Make sure the backend is running and NEXT_PUBLIC_API_BASE points to it.`,
      { cause },
    );
    error.isNetworkError = true;
    throw error;
  }

  let payload = null;
  const responseText = await response.text();
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || `Request failed (${response.status}).`;
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
