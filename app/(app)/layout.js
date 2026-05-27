"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useApp } from "@/context/AppContext";
import { calcStreak } from "@/lib/gameSystem";
import { LANGS } from "@/lib/i18n";
import XPBar from "@/components/XPBar";
import Toast from "@/components/Toast";

const NAV = [
  { href: "/dashboard",    icon: "⚡", key: "dashboard"    },
  { href: "/todos",        icon: "✅", key: "todos"        },
  { href: "/habits",       icon: "🔥", key: "habits"       },
  { href: "/calendar",     icon: "📅", key: "calendar"     },
  { href: "/stats",        icon: "📊", key: "stats"        },
  { href: "/achievements", icon: "🏆", key: "achievements" },
];

const SIDEBAR_FULL = 220;
const SIDEBAR_MINI = 64;

export default function AppLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { t, lang, changeLang, theme, toggleTheme, level, xpInfo,
          requestNotifications, initialized, unlocked } = useApp();

  const [collapsed,    setCollapsed]    = useState(false);
  const [streak,       setStreak]       = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifStatus,  setNotifStatus]  = useState("default");
  const [name,         setName]         = useState("");

  useEffect(() => {
    if (!localStorage.getItem("lu_user")) { router.replace("/login"); return; }
    const uid = localStorage.getItem("lu_user") || "guest";
    const raw = localStorage.getItem(`lu_habits_${uid}`);
    setStreak(calcStreak(raw ? JSON.parse(raw) : {}));
    setName(localStorage.getItem("lu_name") || "User");
    setCollapsed(localStorage.getItem("lu_sidebar_collapsed") === "true");
    if (typeof Notification !== "undefined") setNotifStatus(Notification.permission);
  }, [router]);

  function toggleSidebar() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("lu_sidebar_collapsed", String(next));
      return next;
    });
  }

  async function handleLogout() {
    await signOut(auth).catch(() => {});
    ["lu_user","lu_name"].forEach(k => localStorage.removeItem(k));
    router.replace("/login");
  }

  async function handleNotif() {
    const result = await requestNotifications();
    setNotifStatus(result);
  }

  if (!initialized) return null;

  const sideW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;
  const achCount = unlocked.length;

  /* ── Tooltip for collapsed items ── */
  const Tip = ({ children: ch, label }) => (
    <div style={{ position: "relative" }}
         title={collapsed ? label : undefined}>
      {ch}
    </div>
  );

  return (
    <div className="hf-bg-atmosphere" style={{ minHeight: "100vh", display: "flex" }}>

      {/* ════════════ SIDEBAR (desktop) ════════════ */}
      <aside className="sidebar lu-desktop-side flex-col fixed top-0 left-0 h-full z-20"
             style={{
               width: sideW,
               transition: "width 0.25s cubic-bezier(0.22,1,0.36,1)",
               overflow: "hidden",
             }}>

        {/* Brand row */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: collapsed ? "14px 0" : "14px 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid var(--border)",
          gap: 10, flexShrink: 0,
          transition: "padding 0.25s",
        }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent-lt))",
            borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-accent)", cursor: "pointer",
            overflow: "hidden", padding: 4,
          }} onClick={toggleSidebar} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/symbol-primary.svg" alt="HF" style={{ width: 24, height: 24 }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/habit-forge-wordmark-dark.svg" alt="Habit Forge" style={{ height: 18, display: "block" }} />
              <div style={{ fontSize: 10, color: "var(--ember-lt)", fontWeight: 600, marginTop: 2 }}>
                Lv.{level} · {name}
              </div>
            </div>
          )}
        </div>

        {/* XP bar */}
        {collapsed ? (
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", textAlign: "center", marginBottom: 4 }}>
              {level}
            </div>
            <div className="progress-track" style={{ height: 4 }}>
              <div className="progress-fill" style={{ height: "100%", width: `${xpInfo.pct}%` }} />
            </div>
          </div>
        ) : (
          <XPBar />
        )}

        {/* Streak */}
        {streak > 0 && (
          <div style={{
            padding: collapsed ? "6px 0" : "6px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            {!collapsed && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fb923c", whiteSpace: "nowrap" }}>
                {streak} {t("streak")}
              </span>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: collapsed ? "10px 8px" : "10px 10px", overflowY: "auto" }}>
          {NAV.map(({ href, icon, key }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                    title={collapsed ? t(key) : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? "10px 0" : "9px 12px",
                      borderRadius: 12,
                      marginBottom: 2,
                      fontSize: 13.5, fontWeight: active ? 600 : 500,
                      color: active ? "var(--accent-lt)" : "var(--muted)",
                      background: active ? "var(--accent-dim)" : "transparent",
                      border: `1px solid ${active ? "rgba(124,106,240,0.2)" : "transparent"}`,
                      textDecoration: "none",
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      position: "relative",
                    }}
                    onMouseOver={e => { if (!active) { e.currentTarget.style.background = "var(--hover)"; e.currentTarget.style.color = "var(--text-soft)"; }}}
                    onMouseOut={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}>
                <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1, width: collapsed ? "auto" : 20, textAlign: "center" }}>
                  {icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{t(key)}</span>
                    {key === "achievements" && achCount > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: "var(--accent-dim)", color: "var(--accent-lt)",
                        padding: "1px 7px", borderRadius: 99, flexShrink: 0,
                      }}>{achCount}</span>
                    )}
                  </>
                )}
                {/* Active indicator */}
                {active && collapsed && (
                  <div style={{
                    position: "absolute", left: 0, top: "20%", height: "60%",
                    width: 3, background: "var(--accent)", borderRadius: "0 99px 99px 0",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{
          padding: collapsed ? "8px" : "8px 10px",
          borderTop: "1px solid var(--border)",
        }}>
          <button onClick={() => setSettingsOpen(true)}
                  title={collapsed ? t("settings") : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: collapsed ? 0 : 10, width: "100%",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    borderRadius: 12, border: "none", background: "none",
                    color: "var(--muted)", fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "var(--hover)"; e.currentTarget.style.color = "var(--text-soft)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--muted)"; }}>
            <span style={{ fontSize: 17 }}>⚙️</span>
            {!collapsed && <span>{t("settings")}</span>}
          </button>

          <button onClick={handleLogout}
                  title={collapsed ? t("signOut") : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: collapsed ? 0 : 10, width: "100%",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    borderRadius: 12, border: "none", background: "none",
                    color: "var(--danger)", fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "none"; }}>
            <span style={{ fontSize: 17 }}>🚪</span>
            {!collapsed && <span>{t("signOut")}</span>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div style={{
            padding: "6px 0 8px",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 10, color: "var(--muted)" }}>
              © {new Date().getFullYear()} Sutanology · Habit Forge
            </p>
          </div>
        )}

        {/* Collapse toggle button */}
        <button onClick={toggleSidebar}
                title={collapsed ? "Expand" : "Collapse"}
                style={{
                  position: "absolute", right: -12, top: 22,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)", fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", zIndex: 10,
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--muted)"; }}>
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* ════════════ MOBILE TOP BAR ════════════ */}
      <div className="lu-mobile-top app-header fixed top-0 left-0 right-0 z-20
                      items-center justify-between px-4"
           style={{ height: 54 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--accent-lt))",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", padding: 3,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/symbol-primary.svg" alt="HF" style={{ width: 20, height: 20 }} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/habit-forge-wordmark-dark.svg" alt="Habit Forge" style={{ height: 16 }} />
          <span style={{ fontSize: 11, color: "var(--ember-lt)", fontWeight: 700 }}>Lv.{level}</span>
          {streak > 0 && (
            <span style={{ fontSize: 11, color: "#fb923c", fontWeight: 700 }}>🔥{streak}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80 }}><XPBar compact /></div>
          <button onClick={() => setSettingsOpen(true)}
                  style={{ color: "var(--muted)", fontSize: 18, padding: "4px",
                           background: "none", border: "none", cursor: "pointer" }}>
            ⚙️
          </button>
        </div>
      </div>

      {/* ════════════ MOBILE BOTTOM NAV ════════════ */}
      <nav className="lu-mobile-bottom app-header fixed bottom-0 left-0 right-0 z-20"
           style={{ alignItems: "center", height: 60, padding: "0 6px" }}>
        {NAV.map(({ href, icon, key }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 2, padding: "6px 2px",
                    borderRadius: 10, textDecoration: "none",
                    color: active ? "var(--accent-lt)" : "var(--muted)",
                    background: active ? "var(--accent-dim)" : "transparent",
                    fontWeight: active ? 600 : 400,
                    fontSize: 9.5, transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}>
              <span style={{ fontSize: 19 }}>{icon}</span>
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <style>{`
        .lu-mobile-top    { display: flex; }
        .lu-mobile-bottom { display: flex; }
        .lu-desktop-side  { display: none; }
        .lu-main          { margin-left: 0; padding-top: 54px; padding-bottom: 68px; }

        @media (min-width: 768px) {
          .lu-mobile-top    { display: none !important; }
          .lu-mobile-bottom { display: none !important; }
          .lu-desktop-side  { display: flex !important; }
          .lu-main          { margin-left: ${sideW}px; padding-top: 0; padding-bottom: 0; }
        }
      `}</style>

      <main className="lu-main"
            style={{ flex: 1, minWidth: 0, transition: "margin-left 0.25s cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* ════════════ TOAST ════════════ */}
      <Toast />

      {/* ════════════ SETTINGS MODAL ════════════ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
             style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
             onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}>

          <div className="card anim-scale-in w-full md:max-w-sm"
               style={{
                 borderRadius: "24px 24px 0 0",
                 maxHeight: "90vh", overflowY: "auto",
               }}>

            {/* Handle mobile */}
            <div className="mx-auto mb-4 md:hidden"
                 style={{ width: 36, height: 4, borderRadius: 99, background: "var(--border)" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>
                ⚙️ {t("settings")}
              </h2>
              <button onClick={() => setSettingsOpen(false)}
                      style={{ color: "var(--muted)", fontSize: 20, background: "none",
                               border: "none", cursor: "pointer" }}>✕</button>
            </div>

            {/* Appearance */}
            <section style={{ marginBottom: 20 }}>
              <p className="label">{t("appearance")}</p>
              <button onClick={toggleTheme}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        justifyContent: "space-between", padding: "12px 14px",
                        borderRadius: 14, border: "1px solid var(--border)",
                        background: "var(--hover)", cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 500 }}>
                  {theme === "dark" ? "🌙 " + t("darkMode") : "☀️ " + t("lightMode")}
                </span>
                <div className={`toggle-track ${theme === "dark" ? "on" : "off"}`}>
                  <div className="toggle-thumb" />
                </div>
              </button>
            </section>

            {/* Language */}
            <section style={{ marginBottom: 20 }}>
              <p className="label">{t("language")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(LANGS).map(([code, label]) => (
                  <button key={code} onClick={() => changeLang(code)}
                          style={{
                            padding: "10px 12px", borderRadius: 12,
                            border: `1.5px solid ${lang === code ? "var(--accent)" : "var(--border)"}`,
                            background: lang === code ? "var(--accent)" : "var(--hover)",
                            color: lang === code ? "#fff" : "var(--text-soft)",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            textAlign: "left", transition: "all 0.18s",
                          }}>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Notifications */}
            <section style={{ marginBottom: 20 }}>
              <p className="label">{t("notifications")}</p>
              <button onClick={handleNotif} disabled={notifStatus === "granted"}
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 12,
                        border: `1px solid ${notifStatus === "granted" ? "rgba(52,211,153,0.4)"
                                           : notifStatus === "denied" ? "rgba(248,113,113,0.4)"
                                           : "var(--border)"}`,
                        background: notifStatus === "granted" ? "rgba(52,211,153,0.08)"
                                  : notifStatus === "denied" ? "rgba(248,113,113,0.08)"
                                  : "var(--hover)",
                        color: notifStatus === "granted" ? "var(--success)"
                             : notifStatus === "denied" ? "var(--danger)" : "var(--muted)",
                        fontSize: 13, fontWeight: 500, cursor: notifStatus === "granted" ? "default" : "pointer",
                        textAlign: "left",
                      }}>
                {notifStatus === "granted" ? `✅ ${t("notifEnabled")}`
                 : notifStatus === "denied" ? `❌ ${t("notifDenied")}`
                 : `🔔 ${t("enableNotif")}`}
              </button>
            </section>

            <button onClick={handleLogout} className="btn-danger w-full">
              🚪 {t("signOut")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
