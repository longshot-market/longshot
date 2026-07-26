"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

/** Header auth control: Sign in / Sign up when logged out, account menu when in.
 *  Renders nothing when Supabase isn't configured. */
export default function AuthButtons() {
  const { configured, user, loading, openAuth, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!configured || loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openAuth}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={openAuth}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold uppercase text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
          {(user.email ?? "?").slice(0, 1)}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{user.email}</span>
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="truncate px-3 py-1.5 text-xs text-zinc-400">{user.email}</div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void signOut();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
