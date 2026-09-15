"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-3xl bg-white p-6 text-ink-soft">
        Supabase is not configured yet. Add your project URL and publishable key to{" "}
        <code className="rounded bg-cream-dark px-1">.env.local</code>, then create an admin user in
        the Supabase dashboard.
      </p>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured yet.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Unable to sign in. Please check your email and password.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="studio-card space-y-4 rounded-3xl bg-white p-6">
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Email</span>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-pink-deep">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-purple-deep px-5 py-3 font-bold text-white hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
