"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { hasErrors, validateEmail, validateText } from "../../lib/validation";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    recoveryWord: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);

  const updateForm = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    nextErrors.email = validateEmail(form.email, { required: true });
    nextErrors.recoveryWord = validateText(form.recoveryWord, "Recovery word", {
      required: true,
    });

    if (!form.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (form.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

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
      const data = await apiRequest("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          recoveryWord: form.recoveryWord.trim(),
          newPassword: form.newPassword,
        }),
      });

      setStatus({ type: "success", message: data.message || "Password reset successfully" });
      setForm({
        email: "",
        recoveryWord: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const inputClass = (field) =>
    `rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition ${
      errors[field]
        ? "border-rose-400 focus:border-rose-400"
        : "border-slate-200 focus:border-slate-400"
    }`;

  return (
    <div className="min-h-screen px-4 py-5 md:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1260px] gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[34px] border border-slate-200 bg-[#142235] px-6 py-6 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
            Account Recovery
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Recover access with your recovery word
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Use the recovery word you provided during registration to reset your
            password securely.
          </p>
        </section>

        <section className="rounded-[34px] border border-slate-200 bg-white/88 px-6 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Forgot Password
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Reset your password
            </h2>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Email
              <input
                type="text"
                inputMode="email"
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
              Recovery word
              <input
                value={form.recoveryWord}
                onChange={updateForm("recoveryWord")}
                className={inputClass("recoveryWord")}
                placeholder="Enter your recovery word"
              />
              {errors.recoveryWord ? (
                <span className="text-xs font-normal text-rose-600">
                  {errors.recoveryWord}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-600">
              New password
              <input
                type="password"
                value={form.newPassword}
                onChange={updateForm("newPassword")}
                className={inputClass("newPassword")}
                placeholder="Enter new password"
              />
              {errors.newPassword ? (
                <span className="text-xs font-normal text-rose-600">
                  {errors.newPassword}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Confirm password
              <input
                type="password"
                value={form.confirmPassword}
                onChange={updateForm("confirmPassword")}
                className={inputClass("confirmPassword")}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword ? (
                <span className="text-xs font-normal text-rose-600">
                  {errors.confirmPassword}
                </span>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Resetting..." : "Reset password"}
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <Link className="underline underline-offset-4" href="/login">
              Back to sign in
            </Link>
            <Link className="underline underline-offset-4" href="/register">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
