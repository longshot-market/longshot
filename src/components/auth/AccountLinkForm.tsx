"use client";

// The Polymarket account picker (username or wallet, with live recommendations).
// Used inside the /welcome onboarding modal. On success it writes the primary
// linked_accounts row and moves the user to their tracker.

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorClass, inputClass, primaryBtn } from "./ui";

interface Suggestion {
  name: string;
  proxyWallet: string;
  profileImage: string | null;
}

const isWallet = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s.trim());

// `onLinked` lets a parent flow take over after the account is saved (e.g. to
// show the onboarding questionnaire). When omitted, the form navigates straight
// to the user's tracker on its own.
export default function AccountLinkForm({
  onLinked,
}: {
  onLinked?: (handle: string) => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2 || isWallet(q)) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { profiles: Suggestion[] };
        setSuggestions(data.profiles);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }

  async function saveAccount(
    input: string,
    wallet: string | null,
    username: string | null
  ) {
    setError(null);
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return setError("Your session expired — please sign in again.");
    }
    const { error } = await supabase.from("linked_accounts").insert({
      user_id: user.id,
      input,
      wallet,
      username,
      is_primary: true,
    });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const handle = username ?? wallet ?? input;
    if (onLinked) {
      onLinked(handle);
      return;
    }
    router.push(`/t/${encodeURIComponent(handle)}`);
    router.refresh();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (isWallet(q)) saveAccount(q, q.toLowerCase(), null);
    else saveAccount(q, null, null); // resolved by the tracker route
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        autoFocus
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Polymarket username or 0x address"
        spellCheck={false}
        autoComplete="off"
        className={inputClass}
      />
      {suggestions.length > 0 && (
        <ul className="max-h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          {suggestions.map((s) => (
            <li key={s.proxyWallet}>
              <button
                type="button"
                disabled={busy}
                onClick={() => saveAccount(s.name, s.proxyWallet, s.name)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
              >
                {s.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300">
                    {s.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {s.name}
                </span>
                <span className="ml-auto shrink-0 font-mono text-xs text-zinc-400">
                  {s.proxyWallet.slice(0, 6)}…{s.proxyWallet.slice(-4)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={busy || query.trim().length === 0} className={`${primaryBtn} text-sm`}>
        {busy ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
