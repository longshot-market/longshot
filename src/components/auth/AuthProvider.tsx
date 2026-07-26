"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "./AuthModal";

interface AuthValue {
  /** Whether Supabase is configured at all (false in forks without env). */
  configured: boolean;
  user: User | null;
  loading: boolean;
  openAuth: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  configured: false,
  user: null,
  loading: false,
  openAuth: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Without config, render children with the default (unconfigured) context so
  // the public tracker still works and auth UI stays hidden.
  if (!SUPABASE_CONFIGURED) return <>{children}</>;
  return <ConfiguredAuthProvider>{children}</ConfiguredAuthProvider>;
}

function ConfiguredAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const openAuth = useCallback(() => setModalOpen(true), []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthValue>(
    () => ({ configured: true, user, loading, openAuth, signOut }),
    [user, loading, openAuth, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </AuthContext.Provider>
  );
}
