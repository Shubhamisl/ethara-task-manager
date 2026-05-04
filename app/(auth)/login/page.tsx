"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
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
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Log in to continue to your workspace.</p>

            <div style={{ height: 28 }} />

            <div className="vstack" style={{ gap: 14 }}>
              <div className="field">
                <label className="field-label" htmlFor="email">
                  Work email
                </label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label className="field-label" htmlFor="password" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                </div>
                <input
                  className="input"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
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
                {loading ? "Logging in…" : "Log in"}
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
              No account?{" "}
              <Link href="/signup">Create one</Link>
            </p>
          </form>
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: "var(--ink-7)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>© 2026 Ethara, Inc.</span>
          <span style={{ display: "flex", gap: 14 }}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Status</a>
          </span>
        </div>
      </div>

      {/* Art side */}
      <div className="auth-art-side">
        <div className="auth-art-grid" />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--green-9)",
              display: "inline-block",
            }}
          />
          All systems operational
        </div>

        <div>
          <div className="auth-quote">
            &ldquo;Ethara is the calmest task manager we&apos;ve used. It gets out of the
            way and lets the team ship.&rdquo;
          </div>
          <div className="auth-quote-author">
            Jordan Pierce — Head of Engineering, Northwind
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: 32,
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
              }}
            >
              4,200+
            </div>
            teams
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
              }}
            >
              SOC 2
            </div>
            type II certified
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
              }}
            >
              99.99%
            </div>
            uptime
          </div>
        </div>
      </div>
    </div>
  );
}
