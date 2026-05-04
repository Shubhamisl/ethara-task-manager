/* global React, Icon, Avatar, PriorityChip */

const { useState: useStateAuth } = React;

// ---------- Auth screens ----------
function LoginPage({ onLogin, onSwitch }) {
  const [email, setEmail] = useStateAuth("admin@demo.com");
  const [password, setPassword] = useStateAuth("demo1234");
  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="auth-brand">
          <div className="sb-brand-mark">E</div>
          <div className="sb-brand-name">Ethara</div>
        </div>
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Log in to continue to your workspace.</p>
            <div style={{ height: 24 }} />
            <div className="vstack" style={{ gap: 14 }}>
              <button type="button" className="btn btn-secondary" style={{ height: 38, justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.69-1.56 2.69-3.85 2.69-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.83.86-3.06.86a5.32 5.32 0 0 1-5-3.68H.96v2.32A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M4 10.74a5.41 5.41 0 0 1 0-3.46V4.96H.96a9 9 0 0 0 0 8.08L4 10.74z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96L4 7.28A5.32 5.32 0 0 1 9 3.58z"/></svg>
                Continue with Google
              </button>
              <div className="auth-divider">or</div>
              <div className="field">
                <label className="field-label">Work email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                  <a style={{ fontSize: 12, color: "var(--ink-9)", textDecoration: "underline" }}>Forgot?</a>
                </div>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Log in <Icon name="arrowRight" size={14} stroke={2} /></button>
            </div>
            <div style={{ height: 20 }} />
            <p className="auth-foot">No account? <a onClick={onSwitch} style={{ cursor: "pointer" }}>Create one</a></p>
          </form>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-7)", display: "flex", justifyContent: "space-between" }}>
          <span>© 2026 Ethara, Inc.</span>
          <span className="hstack" style={{ gap: 14 }}>
            <a>Privacy</a><a>Terms</a><a>Status</a>
          </span>
        </div>
      </div>

      <div className="auth-art-side">
        <div className="auth-art-grid" />
        <div className="hstack" style={{ position: "relative", zIndex: 1, gap: 6, fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.005em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-9)", display: "inline-block" }} />
          All systems operational
        </div>
        <div>
          <div className="auth-quote">
            “Ethara is the calmest task manager we’ve used. It gets out of the way and lets the team ship.”
          </div>
          <div className="auth-quote-author">Jordan Pierce — Head of Engineering, Northwind</div>
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          <div><div style={{ fontSize: 22, color: "white", fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.025em" }}>4,200+</div>teams</div>
          <div><div style={{ fontSize: 22, color: "white", fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.025em" }}>SOC 2</div>type II certified</div>
          <div><div style={{ fontSize: 22, color: "white", fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.025em" }}>99.99%</div>uptime</div>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ onSignup, onSwitch }) {
  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="auth-brand">
          <div className="sb-brand-mark">E</div>
          <div className="sb-brand-name">Ethara</div>
        </div>
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSignup(); }}>
            <h1 className="auth-title">Create your workspace</h1>
            <p className="auth-sub">Free for teams up to 5. No credit card required.</p>
            <div style={{ height: 24 }} />
            <div className="vstack" style={{ gap: 14 }}>
              <div className="field">
                <label className="field-label">Full name</label>
                <input className="input" placeholder="Avery Chen" />
              </div>
              <div className="field">
                <label className="field-label">Work email</label>
                <input className="input" type="email" placeholder="avery@company.com" />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input className="input" type="password" placeholder="At least 8 characters" />
                <div className="field-hint">Use a mix of letters, numbers, and symbols.</div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>Create workspace <Icon name="arrowRight" size={14} stroke={2} /></button>
            </div>
            <div style={{ height: 20 }} />
            <p className="auth-foot">Already have an account? <a onClick={onSwitch} style={{ cursor: "pointer" }}>Log in</a></p>
          </form>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-7)" }}>By signing up you agree to our Terms and Privacy Policy.</div>
      </div>
      <div className="auth-art-side">
        <div className="auth-art-grid" />
        <div />
        <div className="auth-quote">
          A task manager built for teams that ship.
          <div className="auth-quote-author">Plan, assign, and track work without the noise.</div>
        </div>
        <div />
      </div>
    </div>
  );
}

// ---------- New task / project dialogs ----------
function NewTaskDialog({ onClose }) {
  const members = window.ETHARA_DATA.users;
  const [priority, setP] = useStateAuth("MEDIUM");
  const [assignee, setA] = useStateAuth("u2");
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="dialog-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: "var(--ink-1)", display: "grid", placeItems: "center", color: "var(--ink-9)" }}>
              <Icon name="check" size={15} />
            </span>
            <div>
              <div className="dialog-title">New task</div>
              <div className="dialog-subtitle">Marketing Site Rewrite · MKT-33</div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="tb-iconbtn" onClick={onClose}><Icon name="x" size={15} /></button>
          </div>
        </div>
        <div className="dialog-body">
          <input className="input" style={{ height: 40, fontSize: 15, fontWeight: 500, border: "none", boxShadow: "none", padding: "0 0" }} placeholder="Task title" autoFocus />
          <textarea className="textarea" placeholder="Add a description, paste links, attach files…" style={{ border: "none", boxShadow: "none", padding: "0 0", minHeight: 60 }} />
          <div className="hstack" style={{ flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
            <DialogChip icon="x" label="To do" />
            <DialogChip icon="flag" label="Medium" tone="amber" />
            <DialogChip icon="users" label={window.E.user(assignee)?.name || "Assign"} />
            <DialogChip icon="calendar" label="May 11" />
            <DialogChip icon="plus" label="Add label" tone="dashed" />
          </div>
        </div>
        <div className="dialog-foot">
          <div style={{ marginRight: "auto", fontSize: 12, color: "var(--ink-7)" }} className="hstack">
            <span className="kbd">⌘</span><span className="kbd">↵</span> to submit
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm">Create task</button>
        </div>
      </div>
    </div>
  );
}

function DialogChip({ icon, label, tone }) {
  const styles = {
    base: { dashed: false },
    amber: { bg: "var(--amber-2)", color: "var(--amber-9)", border: "var(--amber-3)" },
    dashed: { bg: "transparent", color: "var(--ink-7)", border: "var(--ink-4)", dashed: true },
  };
  const s = styles[tone] || {};
  return (
    <button style={{
      height: 26, padding: "0 9px", display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg || "var(--ink-1)", color: s.color || "var(--ink-9)",
      border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border || "var(--ink-3)"}`,
      borderRadius: 999, fontSize: 12, fontWeight: 500,
    }}>
      <Icon name={icon} size={12} stroke={2} /> {label}
    </button>
  );
}

function NewProjectDialog({ onClose }) {
  const colors = ["#3F52C9", "#5E3AAE", "#1F6E7A", "#1F7A4D", "#95590C", "#B0352B", "#9B2B6E"];
  const [color, setColor] = useStateAuth("#3F52C9");
  const [key, setKey] = useStateAuth("NEW");
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-head">
          <div className="dialog-title">Create project</div>
          <div className="dialog-subtitle">Group tasks, members, and milestones.</div>
        </div>
        <div className="dialog-body">
          <div className="field">
            <label className="field-label">Project name</label>
            <input className="input" placeholder="e.g. Q3 launch" autoFocus />
          </div>
          <div className="field">
            <label className="field-label">Description (optional)</label>
            <textarea className="textarea" placeholder="What is this project about?" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field">
              <label className="field-label">Key</label>
              <input className="input" value={key} onChange={e => setKey(e.target.value.toUpperCase().slice(0, 5))} style={{ fontFamily: "var(--font-mono)" }} />
            </div>
            <div className="field">
              <label className="field-label">Color</label>
              <div className="hstack" style={{ gap: 6, height: 36, padding: "0 10px", background: "var(--white)", border: "1px solid var(--ink-3)", borderRadius: 6, boxShadow: "var(--shadow-sm)" }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: 20, height: 20, borderRadius: 4, background: c,
                    border: c === color ? "2px solid var(--ink-12)" : "2px solid transparent",
                    boxShadow: c === color ? "0 0 0 2px var(--white) inset" : "none",
                    padding: 0, cursor: "pointer",
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm">Create project</button>
        </div>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
window.SignupPage = SignupPage;
window.NewTaskDialog = NewTaskDialog;
window.NewProjectDialog = NewProjectDialog;
