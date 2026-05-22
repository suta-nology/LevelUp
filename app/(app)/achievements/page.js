"use client";
import { useApp } from "@/context/AppContext";
import { ACHIEVEMENTS } from "@/lib/gameSystem";

export default function AchievementsPage() {
  const { t, unlocked } = useApp();

  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="page-pad">

      <div className="mb-6 anim-fade-up">
        <h1 style={{ fontWeight: 900, fontSize: 26, color: "var(--text)", letterSpacing: "-0.4px" }}>
          🏆 {t("achievements")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {/* Progress */}
      <div className="card anim-fade-up mb-5" style={{ animationDelay: "0.05s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)" }}>Overall Progress</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#fbbf24" }}>{pct}%</span>
        </div>
        <div className="progress-track" style={{ height: 8 }}>
          <div className="progress-fill" style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
        {ACHIEVEMENTS.map((a, i) => {
          const done = unlocked.includes(a.id);
          return (
            <div key={a.id}
                 className={`card anim-fade-up flex items-center gap-4 ${done ? "card-hover" : ""}`}
                 style={{
                   animationDelay: `${i * 0.04}s`,
                   opacity: done ? 1 : 0.5,
                   borderColor: done ? "rgba(251,191,36,0.25)" : "var(--border)",
                 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                background: done ? "rgba(251,191,36,0.15)" : "var(--hover)",
                border: `1px solid ${done ? "rgba(251,191,36,0.25)" : "var(--border)"}`,
              }}>
                {done ? a.icon : "🔒"}
              </div>
              <div>
                <p style={{
                  fontWeight: 700, fontSize: 13,
                  color: done ? "#fbbf24" : "var(--muted)",
                }}>
                  {t(a.nameKey)}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {t(a.descKey)}
                </p>
                {done && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--success)",
                                 display: "block", marginTop: 4 }}>✓ Unlocked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
