"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import WeeklyProgress from "@/components/WeeklyProgress";
import { useApp } from "@/context/AppContext";
import { calcStreak } from "@/lib/gameSystem";

export default function DashboardPage() {
  const { t, level, xpInfo } = useApp();

  const [timeKey, setTimeKey] = useState("goodMorning");
  const [name,    setName]    = useState("User");
  const [stats,   setStats]   = useState({ todosDone: 0, total: 0, habits: 0, streak: 0 });

  useEffect(() => {
    const h = new Date().getHours();
    setTimeKey(h < 12 ? "goodMorning" : h < 18 ? "goodAfternoon" : "goodEvening");

    const n = localStorage.getItem("lu_name");
    if (n) setName(n);

    const uid    = localStorage.getItem("lu_user") || "guest";
    const today  = new Date().toISOString().slice(0, 10);
    const todos  = JSON.parse(localStorage.getItem(`lu_todos_${uid}`) || "[]");
    const habits = JSON.parse(localStorage.getItem(`lu_habits_${uid}`) || "{}");
    const done   = Object.keys(habits).filter(k => k.endsWith(`_${today}`) && habits[k]).length;

    setStats({
      todosDone: todos.filter(t => t.done).length,
      total:     todos.length,
      habits:    done,
      streak:    calcStreak(habits),
    });
  }, []);

  const statCards = [
    { icon: "✅", value: `${stats.todosDone}/${stats.total}`, label: t("tasksDone"),   color: "#34d399" },
    { icon: "🔥", value: `${stats.habits}/6`,                 label: t("habitsToday"), color: "#fb923c" },
    { icon: "⚡", value: stats.streak > 0 ? `${stats.streak}🔥` : t("streakNone"), label: t("streakLabel"), color: "#fbbf24" },
    { icon: "📊", value: `${xpInfo.pct}%`,                    label: `${t("level")} ${level}`, color: "var(--accent-lt)" },
  ];

  const quickLinks = [
    { href: "/todos",  icon: "✅", key: "todos",
      desc: stats.total === 0 ? t("noTasksYet") : `${stats.total - stats.todosDone} ${t("tasksPending")}`,
      grad: "linear-gradient(135deg, #065f46, #047857)" },
    { href: "/habits", icon: "🔥", key: "habits",
      desc: stats.habits === 0 ? t("startHabits") : `${stats.habits}/6 ${t("habitsToday")}`,
      grad: "linear-gradient(135deg, #7c2d12, #b45309)" },
    { href: "/stats",  icon: "📊", key: "stats",
      desc: t("viewProgress"),
      grad: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  ];

  return (
    <div className="page-pad">

      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>
          {t(timeKey)} 👋
        </p>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(22px, 5vw, 32px)",
                     color: "var(--text)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          {t("welcomeBack")}, {name}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger">
        {statCards.map(({ icon, value, label, color }) => (
          <div key={label} className="card card-hover anim-fade-up"
               style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 4, lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly progress */}
      <div className="card anim-fade-up mb-4" style={{ animationDelay: "0.15s" }}>
        <h2 style={{ fontWeight: 700, color: "var(--text)", marginBottom: 16, fontSize: 14 }}>
          {t("weeklyProgress")}
        </h2>
        <WeeklyProgress />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
        {quickLinks.map(({ href, icon, key, desc, grad }) => (
          <Link key={href} href={href}
                className="card-interactive anim-fade-up flex items-center gap-4 p-4"
                style={{ background: grad, border: "none" }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{t(key)}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
