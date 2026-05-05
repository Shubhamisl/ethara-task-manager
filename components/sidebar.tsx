"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { projectColor } from "@/lib/project-style";

type Project = {
  id: string;
  name: string;
};

type User = {
  name: string;
  email: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "avatar-c1",
  "avatar-c2",
  "avatar-c3",
  "avatar-c4",
  "avatar-c5",
  "avatar-c6",
  "avatar-c7",
];

function avatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Sidebar({
  user,
  projects,
}: {
  user: User;
  projects: Project[];
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ),
    },
    {
      href: "/dashboard",
      label: "My Tasks",
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2.5 7.5L5.5 10.5L12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/projects",
      label: "Projects",
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 4V3C5 2.44772 5.44772 2 6 2H9C9.55228 2 10 2.44772 10 3V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 248,
        background: "var(--white)",
        borderRight: "1px solid var(--ink-3)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        className="app-sidebar-brand"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          height: 52,
          borderBottom: "1px solid var(--ink-3)",
          flexShrink: 0,
        }}
      >
        <div className="sb-brand-mark">E</div>
        <span className="sb-brand-name">Ethara</span>
      </div>

      {/* Search */}
      <div className="app-sidebar-search" style={{ margin: "12px 12px 4px", position: "relative", flexShrink: 0 }}>
        <span
          style={{
            position: "absolute",
            left: 9,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-7)",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          style={{
            width: "100%",
            height: 32,
            background: "var(--ink-1)",
            border: "1px solid transparent",
            borderRadius: 6,
            padding: "0 52px 0 30px",
            fontSize: 13,
            color: "var(--ink-11)",
            transition: "all 120ms ease",
          }}
          placeholder="Search…"
          onFocus={(e) => {
            e.currentTarget.style.background = "var(--white)";
            e.currentTarget.style.borderColor = "var(--ink-4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-2)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = "var(--ink-1)";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--ink-7)",
            background: "var(--white)",
            border: "1px solid var(--ink-3)",
            borderRadius: 3,
            padding: "1px 5px",
            pointerEvents: "none",
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Nav */}
      <nav className="app-sidebar-nav" style={{ padding: "8px 8px 0", flex: 1, overflowY: "auto" }}>
        {navLinks.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: 6,
                color: isActive ? "var(--ink-12)" : "var(--ink-9)",
                fontSize: 13.5,
                fontWeight: isActive ? 500 : 450,
                background: isActive ? "var(--ink-2)" : "transparent",
                marginBottom: 2,
                textDecoration: "none",
                transition: "background 80ms ease, color 80ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--ink-2)";
                  e.currentTarget.style.color = "var(--ink-12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink-9)";
                }
              }}
            >
              <span style={{ color: isActive ? "var(--ink-12)" : "var(--ink-7)", display: "flex" }}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="app-sidebar-projects">
            <div
              style={{
                padding: "14px 8px 6px",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                color: "var(--ink-7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Projects
              <Link
                href="/projects"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  color: "var(--ink-7)",
                }}
                title="View all projects"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2.5H9.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
            {projects.map((project) => {
              const isActive = pathname.startsWith(`/projects/${project.id}`);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 8px",
                    borderRadius: 6,
                    color: isActive ? "var(--ink-12)" : "var(--ink-9)",
                    fontSize: 13.5,
                    fontWeight: isActive ? 500 : 400,
                    background: isActive ? "var(--ink-2)" : "transparent",
                    marginBottom: 2,
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "background 80ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--ink-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className="sb-project-dot"
                    style={{ background: projectColor(project.id) }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {project.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className="app-sidebar-footer"
        style={{
          padding: 8,
          borderTop: "1px solid var(--ink-3)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 8px",
            borderRadius: 6,
          }}
        >
          <div
            className={`avatar avatar-lg ${avatarColor(user.name)}`}
            style={{ flexShrink: 0 }}
          >
            {getInitials(user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-11)",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-7)",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="tb-iconbtn"
            title="Log out"
            style={{ flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path
                d="M6 13H2.5C2.22386 13 2 12.7761 2 12.5V2.5C2 2.22386 2.22386 2 2.5 2H6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M10 10L13 7.5L10 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 7.5H6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
