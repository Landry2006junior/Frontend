"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";
import { clearAuth, getStoredAuth } from "../lib/auth";

export default function ItemsVault({ onLogout }) {
  const [auth, setAuth] = useState({ token: "", user: null });
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [itemForm, setItemForm] = useState({ title: "", description: "" });

  const authHeaders = useMemo(() => {
    if (!auth.token) return {};
    return { Authorization: `Bearer ${auth.token}` };
  }, [auth.token]);

  useEffect(() => {
    setAuth(getStoredAuth());
  }, []);

  const setError = (message) => setStatus({ type: "error", message });
  const setSuccess = (message) => setStatus({ type: "success", message });

  const updateItemForm = (field) => (event) => {
    setItemForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/items`, {
        headers: { ...authHeaders },
      });
      const data = await response.json();
      if (response.status === 401) {
        clearAuth();
        onLogout?.();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Unable to load items.");
      }
      setItems(data);
    } catch (error) {
      setError(error.message);
    }
  }, [authHeaders, onLogout]);

  useEffect(() => {
    if (!auth.token) return;
    queueMicrotask(() => {
      void fetchItems();
    });
  }, [auth.token, fetchItems]);

  const createItem = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: itemForm.title.trim(),
          description: itemForm.description.trim(),
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        clearAuth();
        onLogout?.();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Unable to create item.");
      }
      setItems((prev) => [data, ...prev]);
      setItemForm({ title: "", description: "" });
      setSuccess("Item created.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (id) => {
    setStatus({ type: "", message: "" });
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders },
      });
      const data = await response.json();
      if (response.status === 401) {
        clearAuth();
        onLogout?.();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Unable to delete item.");
      }
      setItems((prev) => prev.filter((item) => item._id !== id));
      setSuccess("Item removed.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    onLogout?.();
  };

  return (
    <section className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#92a0bf]">
            Items Vault
          </p>
          <h2 className="text-2xl font-semibold">Your private items</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#1a2237] px-4 py-3 text-xs text-[#b7c3df]">
            {items.length} total
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-[#f6c453] transition hover:border-[#f6c453]"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#b7c3df]">
        Signed in as{" "}
        <span className="font-semibold text-white">
          {auth.user?.username || auth.user?.email || "User"}
        </span>
      </div>

      <form className="grid gap-4" onSubmit={createItem}>
        <label className="flex flex-col gap-2 text-sm text-[#b7c3df]">
          Title
          <input
            value={itemForm.title}
            onChange={updateItemForm("title")}
            required
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#f6c453]"
            placeholder="Shadow brief"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-[#b7c3df]">
          Description
          <textarea
            value={itemForm.description}
            onChange={updateItemForm("description")}
            required
            rows={3}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#f6c453]"
            placeholder="Describe why this entry matters..."
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-[#69f0c6] px-4 py-3 font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Saving..." : "Create item"}
        </button>
      </form>

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

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-10 text-center text-sm text-[#b7c3df]">
            No items yet. Create your first protected record.
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-[#b7c3df]">{item.description}</p>
                </div>
                <button
                  onClick={() => deleteItem(item._id)}
                  className="rounded-full border border-white/10 px-3 py-2 text-xs text-rose-200 transition hover:border-rose-400"
                >
                  Remove
                </button>
              </div>
              <div className="text-xs text-[#92a0bf]">Item ID: {item._id}</div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
