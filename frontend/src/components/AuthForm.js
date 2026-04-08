"use client";

import { useState } from "react";
import { apiRequest } from "../lib/api";
import { saveAuth } from "../lib/auth";
export default function AuthForm({ mode = "login", onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  const updateForm = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", message: "" });

    try {
      const endpoint = mode === "register" ? "register" : "login";
      const payload =
        mode === "register"
          ? {
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
            }
          : { email: form.email.trim(), password: form.password };

      const data = await apiRequest(`/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      saveAuth(data.token, data.user);
      setForm({ username: "", email: "", password: "" });
      setStatus({ type: "success", message: data.message || "Welcome." });
      onSuccess?.(data);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <label className="flex flex-col gap-2 text-sm text-[#b7c3df]">
          Username
          <input
            value={form.username}
            onChange={updateForm("username")}
            required
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#69f0c6]"
            placeholder="NovaAster"
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm text-[#b7c3df]">
        Email
        <input
          type="email"
          value={form.email}
          onChange={updateForm("email")}
          required
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#69f0c6]"
          placeholder="you@domain.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-[#b7c3df]">
        Password
        <input
          type="password"
          value={form.password}
          onChange={updateForm("password")}
          required
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#69f0c6]"
          placeholder="password"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-2xl bg-[#f6c453] px-4 py-3 font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      >
        {busy
          ? "Processing..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      {status.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </form>
  );
}
