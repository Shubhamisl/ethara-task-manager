/* global React */
// Mock data and shared utilities for Ethara prototype

const ETHARA_DATA = (() => {
  const today = new Date();
  const day = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString();
  };

  const users = [
    { id: "u1", name: "Demo Admin", email: "admin@demo.com", color: 1, role: "ADMIN", joined: "Jan 4, 2026" },
    { id: "u2", name: "Alice Tan",   email: "alice@demo.com", color: 2, role: "MEMBER", joined: "Jan 9, 2026" },
    { id: "u3", name: "Bob Mendez",  email: "bob@demo.com",   color: 3, role: "MEMBER", joined: "Feb 2, 2026" },
    { id: "u4", name: "Priya Shah",  email: "priya@demo.com", color: 4, role: "MEMBER", joined: "Feb 12, 2026" },
    { id: "u5", name: "Marcus Lee",  email: "marcus@demo.com",color: 5, role: "MEMBER", joined: "Mar 1, 2026" },
    { id: "u6", name: "Yuki Tanaka", email: "yuki@demo.com",  color: 6, role: "MEMBER", joined: "Mar 18, 2026" },
    { id: "u7", name: "Sara Khan",   email: "sara@demo.com",  color: 7, role: "MEMBER", joined: "Apr 3, 2026" },
  ];

  const projects = [
    {
      id: "p1",
      name: "Marketing Site Rewrite",
      key: "MKT",
      description: "Refresh ethara.com — new IS, hero, pricing, and a customer-stories section before Q3 launch.",
      color: "#3F52C9",
      status: "On track",
      progress: 0.62,
      memberIds: ["u1", "u2", "u3", "u4"],
    },
    {
      id: "p2",
      name: "Mobile App v2.0",
      key: "MOB",
      description: "Native iOS + Android rebuild on shared core. Targeting public beta in 6 weeks.",
      color: "#5E3AAE",
      status: "At risk",
      progress: 0.34,
      memberIds: ["u1", "u3", "u5", "u6"],
    },
    {
      id: "p3",
      name: "API Platform",
      key: "API",
      description: "v3 REST + GraphQL gateway with revised auth, idempotency, and rate-limit semantics.",
      color: "#1F6E7A",
      status: "On track",
      progress: 0.81,
      memberIds: ["u1", "u4", "u5"],
    },
    {
      id: "p4",
      name: "Customer Onboarding",
      key: "ONB",
      description: "Reduce time-to-value: onboarding tour, sample workspace, and a guided first-task flow.",
      color: "#1F7A4D",
      status: "Planning",
      progress: 0.12,
      memberIds: ["u1", "u2", "u7"],
    },
    {
      id: "p5",
      name: "Q3 OKRs",
      key: "OKR",
      description: "Company objectives and key results for Q3 2026 — owners, metrics, and weekly check-ins.",
      color: "#95590C",
      status: "On track",
      progress: 0.48,
      memberIds: ["u1", "u2", "u4", "u5", "u6"],
    },
    {
      id: "p6",
      name: "SOC 2 Readiness",
      key: "SEC",
      description: "Type II audit prep. Policies, evidence collection, vendor reviews, security training.",
      color: "#B0352B",
      status: "Blocked",
      progress: 0.22,
      memberIds: ["u1", "u4"],
    },
  ];

  // Tasks for the active project (p1)
  const tasks = [
    { id: "t1",  key: "MKT-24", title: "Hero copy + headline experiments",   description: "Three headline variants for the new homepage hero. A/B test plan with Marketing.", status: "IN_PROGRESS", priority: "HIGH",   dueOffset: 2,  assigneeId: "u2", labels: ["copy", "homepage"] },
    { id: "t2",  key: "MKT-25", title: "Footer redesign",                    description: "New IA for footer — products, company, resources. Trim legal language.",            status: "TODO",        priority: "MEDIUM", dueOffset: 5,  assigneeId: "u3", labels: ["design"] },
    { id: "t3",  key: "MKT-26", title: "Set up GA4 + product analytics",     description: "Wire GA4, define core events, ship dashboard for marketing.",                       status: "TODO",        priority: "LOW",    dueOffset: -1, assigneeId: null, labels: ["analytics"] },
    { id: "t4",  key: "MKT-21", title: "Domain DNS + edge config",           description: "Move primary apex to new edge. Verify cert chain and HSTS preload.",                status: "DONE",        priority: "MEDIUM", dueOffset: -4, assigneeId: "u1", labels: ["infra"] },
    { id: "t5",  key: "MKT-27", title: "Pricing page — annual toggle",       description: "Annual/monthly toggle with savings callout. Match new design.",                     status: "IN_PROGRESS", priority: "HIGH",   dueOffset: 1,  assigneeId: "u4", labels: ["frontend", "pricing"] },
    { id: "t6",  key: "MKT-28", title: "Customer stories — 3 case studies",  description: "Outline + interviews + drafts for Acme, Lumen, Northwind.",                          status: "TODO",        priority: "MEDIUM", dueOffset: 9,  assigneeId: "u2", labels: ["content"] },
    { id: "t7",  key: "MKT-22", title: "Cross-browser QA pass",              description: "Safari 16+, Firefox ESR, Chromium evergreen. File defects, prioritize fixes.",        status: "DONE",        priority: "LOW",    dueOffset: -7, assigneeId: "u3", labels: ["qa"] },
    { id: "t8",  key: "MKT-29", title: "Image asset audit",                  description: "Re-export hero + product imagery to AVIF + WebP. Lazy-load below the fold.",          status: "TODO",        priority: "LOW",    dueOffset: 12, assigneeId: "u3", labels: ["perf"] },
    { id: "t9",  key: "MKT-30", title: "Cookie consent banner — EU regions", description: "GDPR-compliant CMP. Granular categories. Persist preference.",                       status: "IN_PROGRESS", priority: "MEDIUM", dueOffset: 3,  assigneeId: "u4", labels: ["legal", "frontend"] },
    { id: "t10", key: "MKT-23", title: "Sitemap + robots.txt",               description: "Generate from CMS, exclude staging. Submit to GSC.",                                 status: "DONE",        priority: "LOW",    dueOffset: -10, assigneeId: "u1", labels: ["seo"] },
    { id: "t11", key: "MKT-31", title: "Headless CMS migration",             description: "Move blog + careers from legacy CMS to Contentful. Map taxonomies.",                  status: "TODO",        priority: "HIGH",   dueOffset: 14, assigneeId: "u2", labels: ["content", "infra"] },
    { id: "t12", key: "MKT-32", title: "Lighthouse > 95 on all pages",       description: "Pass perf, a11y, SEO, best-practices. Monitor weekly.",                                status: "IN_PROGRESS", priority: "MEDIUM", dueOffset: 6,  assigneeId: "u3", labels: ["perf"] },
  ].map(t => ({ ...t, dueDate: t.dueOffset != null ? day(t.dueOffset) : null }));

  // Activity feed
  const activity = [
    { id: "a1", who: "u2", what: "moved", target: "MKT-24 Hero copy",         to: "In progress",  when: "12m ago" },
    { id: "a2", who: "u4", what: "commented on", target: "MKT-27 Pricing page", to: null,         when: "38m ago" },
    { id: "a3", who: "u1", what: "created project", target: "Customer Onboarding", to: null,     when: "2h ago" },
    { id: "a4", who: "u3", what: "completed", target: "MKT-22 QA pass",         to: null,         when: "yesterday" },
    { id: "a5", who: "u5", what: "assigned",  target: "API-19 Rate limits",     to: "Priya Shah", when: "yesterday" },
  ];

  return { users, projects, tasks, activity };
})();

window.ETHARA_DATA = ETHARA_DATA;

// ---------- Helpers ----------
window.E = {
  user: (id) => ETHARA_DATA.users.find(u => u.id === id),
  project: (id) => ETHARA_DATA.projects.find(p => p.id === id),
  initials: (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
  formatDue: (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const ms = d - now;
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";
    if (days > 1 && days < 7) return `In ${days}d`;
    if (days < 0 && days > -7) return `${-days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },
  isOverdue: (iso, status) => {
    if (!iso) return false;
    if (status === "DONE") return false;
    return new Date(iso) < new Date();
  },
};
