export const getStoredAuth = () => {
  if (typeof window === "undefined") return { token: "", user: null };
  const token = window.localStorage.getItem("token") || "";
  const userRaw = window.localStorage.getItem("user");
  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }
  return { token, user };
};

export const saveAuth = (token, user) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("token", token);
  window.localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
};
