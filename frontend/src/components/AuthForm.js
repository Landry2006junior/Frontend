"use client";

import { useState } from "react";
import { apiRequest } from "../lib/api";
import { saveAuth } from "../lib/auth";

const roleOptions = [
  {
    value: "manager",
    label: "Operations Manager",
    description: "Can manage inventory, suppliers, reports, and movements.",
  },
  {
    value: "operator",
    label: "Floor Operator",
    description: "Focused on real-time receiving and issuing workflows.",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full access for governance, reporting, and workspace control.",
  },
];

export default function AuthForm({ mode = "login", onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "manager",
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
            role: form.role,
          }
          : { email: form.email.trim(), password: form.password };

      const data = await apiRequest(`/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      saveAuth(data.token, data.user);
      setForm({ username: "", email: "", password: "", role: "manager" });
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
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Username
          <input
            value={form.username}
            onChange={updateForm("username")}
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
            placeholder="NovaAster"
          />
        </label>
      ) : null}
      {mode === "register" ? (
        <label className="flex flex-col gap-2 text-sm text-slate-600">
          Role
          <select
            value={form.role}
            onChange={updateForm("role")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs leading-5 text-slate-500">
            {
              roleOptions.find((option) => option.value === form.role)
                ?.description
            }
          </span>
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm text-slate-600">
        Email
        <input
          type="email"
          value={form.email}
          onChange={updateForm("email")}
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
          placeholder="you@domain.com"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-600">
        Password
        <input
          type="password"
          value={form.password}
          onChange={updateForm("password")}
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
          placeholder="password"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
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
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </form>
  );
}
