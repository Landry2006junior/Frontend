"use client";

import { useState } from "react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_-+=[]{}|;:,.<>?";

function generatePassword(length = 12) {
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
  const getRandomChar = (charset) =>
    charset[Math.floor(Math.random() * charset.length)];

  let password = "";
  password += getRandomChar(UPPERCASE);
  password += getRandomChar(LOWERCASE);
  password += getRandomChar(NUMBERS);
  password += getRandomChar(SYMBOLS);

  for (let i = password.length; i < length; i += 1) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "bg-rose-500", width: "25%" };
  if (score === 2) return { label: "Fair", color: "bg-amber-500", width: "50%" };
  if (score === 3) return { label: "Good", color: "bg-blue-500", width: "75%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

export default function PasswordGenerator({ onSelect }) {
  const [password, setPassword] = useState(generatePassword(12));
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = getStrength(password);

  const handleGenerate = () => {
    setPassword(generatePassword(12));
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onSelect?.(password);
    } catch {
      setCopied(false);
    }
  };

  const handleUse = () => {
    onSelect?.(password);
  };

  return (
    <div className="mt-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          Password Suggestion
        </p>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {password.length} characters
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 py-2">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          readOnly
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="rounded-xl px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Strength</span>
          <span className="font-medium text-slate-900">{strength.label}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full transition-all ${strength.color}`}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Generate another password
        </button>
        <button
          type="button"
          onClick={handleUse}
          className="rounded-2xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
        >
          Use this password
        </button>
      </div>
    </div>
  );
}
