"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created, but login failed");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-brand">
          <div className="sb-brand-mark">E</div>
          <span className="sb-brand-name">Ethara</span>
        </div>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={onSubmit}>
            <h1 className="auth-title">Create your workspace</h1>
            <p className="auth-sub">Free for teams up to 5. No credit card required.</p>

            <div style={{ height: 28 }} />

            <div className="vstack" style={{ gap: 14 }}>
              <div className="field">
                <label className="field-label" htmlFor="name">
                  Full name
                </label>
                <input
                  className="input"
                  id="name"
                  placeholder="Avery Chen"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="email">
                  Work email
                </label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="avery@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="input"
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <div className="field-hint">Use a mix of letters, numbers, and symbols.</div>
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--red-9)",
                    background: "var(--red-2)",
                    border: "1px solid var(--red-3)",
                    borderRadius: 6,
                    padding: "8px 12px",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loading ? "Creating workspace…" : "Create workspace"}
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M3 7.5H12M8.5 3.5L12.5 7.5L8.5 11.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div style={{ height: 20 }} />

            <p className="auth-foot">
              Already have an account?{" "}
              <Link href="/login">Log in</Link>
            </p>
          </form>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--ink-7)" }}>
          By signing up you agree to our{" "}
          <a href="#" style={{ color: "var(--ink-9)" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="#" style={{ color: "var(--ink-9)" }}>
            Privacy Policy
          </a>
          .
        </div>
      </div>

      {/* Art side */}
      <div className="auth-art-side">
        <div className="auth-art-grid" />
        <div />
        <div className="auth-quote">
          A task manager built for teams that ship.
          <div className="auth-quote-author">
            Plan, assign, and track work without the noise.
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}
