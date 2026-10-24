"use client";

import { useState } from "react";
import { apiRequest } from "../lib/api";
import { saveAuth } from "../lib/auth";
import {
  hasErrors,
  validateEmail,
  validateLettersOnly,
  validateStrongPassword,
  validateText,
} from "../lib/validation";
import PasswordGenerator from "./PasswordGenerator";

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
    recoveryWord: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const updateForm = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (mode === "register") {
      nextErrors.username = validateLettersOnly(form.username, "Username", {
        required: true,
      });
      if (!nextErrors.username) {
        if (form.username.trim().length < 2) {
          nextErrors.username = "Username must be at least 2 characters.";
        }
        if (form.username.trim().length > 100) {
          nextErrors.username = "Username cannot exceed 100 characters.";
        }
      }
      nextErrors.recoveryWord = validateText(form.recoveryWord, "Recovery word", {
        required: true,
      });
    }

    nextErrors.email = validateEmail(form.email, { required: true });
    nextErrors.password = mode === "register"
      ? validateStrongPassword(form.password, { required: true })
      : validateText(form.password, "Password", { required: true });

    if (mode === "register" && !nextErrors.password && form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  };

  const inputClass = (field) =>
    `rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${
      errors[field]
        ? "border-rose-400 focus:border-rose-400"
        : "border-slate-200 focus:border-slate-400"
    }`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setStatus({ type: "", message: "" });

    if (hasErrors(nextErrors)) {
      return;
    }

    setBusy(true);

    try {
      const endpoint = mode === "register" ? "register" : "login";
      const payload =
        mode === "register"
          ? {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            recoveryWord: form.recoveryWord.trim(),
          }
          : { email: form.email.trim(), password: form.password };

      const data = await apiRequest(`/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      saveAuth(data.token, data.user);
      setForm({
        username: "",
        email: "",
        password: "",
        role: "manager",
        recoveryWord: "",
      });
      setErrors({});
      setShowGenerator(false);
      setStatus({ type: "success", message: data.message || "Welcome." });
      onSuccess?.(data);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {mode === "register" ? (
        <>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Username
            <input
              value={form.username}
              onChange={updateForm("username")}
              className={inputClass("username")}
              placeholder="Letters only"
            />
            {errors.username ? (
              <span className="text-xs font-normal text-rose-600">
                {errors.username}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Recovery word
            <input
              value={form.recoveryWord}
              onChange={updateForm("recoveryWord")}
              className={inputClass("recoveryWord")}
              placeholder="Enter a recovery word for password reset"
            />
            {errors.recoveryWord ? (
              <span className="text-xs font-normal text-rose-600">
                {errors.recoveryWord}
              </span>
            ) : null}
          </label>
        </>
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
          type="text"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={updateForm("email")}
          className={inputClass("email")}
          placeholder="you@domain.com"
        />
        {errors.email ? (
          <span className="text-xs font-normal text-rose-600">
            {errors.email}
          </span>
        ) : null}
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-600">
        Password
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={form.password}
          onChange={updateForm("password")}
          className={inputClass("password")}
          placeholder="password"
        />
        {errors.password ? (
          <span className="text-xs font-normal text-rose-600">
            {errors.password}
          </span>
        ) : null}
      </label>
      {mode === "register" ? (
        <div>
          <button
            type="button"
            onClick={() => setShowGenerator((prev) => !prev)}
            className="text-sm font-medium text-blue-700 underline underline-offset-4"
          >
            {showGenerator ? "Hide password suggestion" : "Suggest a strong password"}
          </button>
          {showGenerator ? (
            <PasswordGenerator
              onSelect={(generatedPassword) => {
                setForm((prev) => ({ ...prev, password: generatedPassword }));
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
          ) : null}
        </div>
      ) : null}
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
