"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { calcStreak, XP } from "@/lib/gameSystem";

const LOCALE_MAP = { en:"en-US", id:"id-ID", jp:"ja-JP", ko:"ko-KR", zh:"zh-CN", fr:"fr-FR", de:"de-DE" };
const F_WHITE = "brightness(0) invert(1)";

const HABITS = [
  { id: "gym",    icon: "🏋️", labelKey: "habitGym",    bg: "linear-gradient(135deg,#ea580c,#dc2626)" },
  { id: "study",  icon: "📚", labelKey: "habitStudy",  bg: "linear-gradient(135deg,#2563eb,#4f46e5)" },
  { id: "water",  icon: "💧", labelKey: "habitWater",  bg: "linear-gradient(135deg,#0891b2,#2563eb)" },
  { id: "coding", icon: "💻", labelKey: "habitCoding", bg: "linear-gradient(135deg,#7c3aed,#a21caf)" },
  { id: "read",   icon: "📖", labelKey: "habitRead",   bg: "linear-gradient(135deg,#059669,#0d9488)" },
  { id: "sleep",  icon: "😴", labelKey: "habitSleep",  bg: "linear-gradient(135deg,#4338ca,#1d4ed8)" },
];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function getUID() {
  return typeof window !== "undefined" ? (localStorage.getItem("lu_user") || "guest") : "guest";
}

export default function HabitsPage() {
  const { t, lang, addXP, checkAchievements } = useApp();
  const days   = getLast7Days();
  const today  = new Date().toISOString().slice(0, 10);
  const locale = LOCALE_MAP[lang] || "en-US";

  const [checked, setChecked] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(`lu_habits_${getUID()}`);
    if (raw) setChecked(JSON.parse(raw));
  }, []);

  function isChecked(id, day) { return !!checked[`${id}_${day}`]; }

  const todayDone = HABITS.filter(h => isChecked(h.id, today)).length;
  const pct       = Math.round((todayDone / HABITS.length) * 100);

  function toggle(habitId, day) {
    if (day !== today) return;
    const key = `${habitId}_${day}`;
    setChecked(prev => {
      const wasChecked   = !!prev[key];
      const updated      = { ...prev, [key]: !wasChecked };
      localStorage.setItem(`lu_habits_${getUID()}`, JSON.stringify(updated));

      if (!wasChecked) {
        addXP(XP.HABIT_DONE, t("habitComplete"));
        const todayCount = HABITS.filter(h => updated[`${h.id}_${day}`]).length;
        if (todayCount === HABITS.length)
          setTimeout(() => addXP(XP.PERFECT_DAY, t("perfectDayBonus")), 500);
        checkAchievements({
          streak: calcStreak(updated),
          perfectDays: todayCount === HABITS.length ? 1 : 0,
          tasksCompleted: 0, level: 0,
        });
      }
      return updated;
    });
  }

  return (
    <div className="page-pad">

      {/* Header */}
      <div className="mb-6 anim-fade-up">
        <h1 style={{ fontWeight: 900, fontSize: 26, color: "var(--text)", letterSpacing: "-0.4px" }}>
          {t("habitTracker")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          {todayDone === 0 ? t("tapHabit") : `${todayDone}/${HABITS.length} ${t("habitsToday2")}`}
        </p>
      </div>

      {/* Today's progress card */}
      <div className="card anim-fade-up mb-5"
           style={{ animationDelay: "0.05s", background: pct === 100
             ? "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))"
             : "var(--card)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-soft)" }}>
            {t("todayProgress")}
          </span>
          <span style={{
            fontSize: 20, fontWeight: 900,
            color: pct === 100 ? "var(--success)" : pct === 0 ? "var(--muted)" : "var(--accent-lt)",
          }}>
            {pct}%
          </span>
        </div>
        <div className="progress-track" style={{ height: 10 }}>
          <div className="progress-fill" style={{
            height: "100%", width: `${pct}%`,
            background: pct === 100
              ? "linear-gradient(90deg, #34d399, #10b981)"
              : "linear-gradient(90deg, var(--accent), var(--accent-lt))",
          }} />
        </div>
        {pct === 100 && (
          <p style={{ color: "var(--success)", fontWeight: 700, textAlign: "center",
                      marginTop: 10, fontSize: 13 }}>
            🎉 {t("allHabitsDone")}
          </p>
        )}
      </div>

      {/* Habits table */}
      <div className="card anim-fade-up" style={{ animationDelay: "0.1s", padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11,
                             fontWeight: 700, color: "var(--muted)", width: 160 }}>
                  {t("habitCol")}
                </th>
                {days.map(d => {
                  const isToday = d === today;
                  const dow = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(d + "T00:00:00"));
                  return (
                    <th key={d} style={{ padding: "10px 6px", textAlign: "center",
                                        fontSize: 10, fontWeight: 700,
                                        color: isToday ? "var(--accent-lt)" : "var(--muted)" }}>
                      <div>{dow}</div>
                      <div style={{ opacity: 0.7, marginTop: 1 }}>{d.slice(5)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HABITS.map((habit, hi) => (
                <tr key={habit.id}
                    className="anim-fade-up"
                    style={{ borderTop: "1px solid var(--border)", animationDelay: `${hi * 0.04}s` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{habit.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)" }}>
                        {t(habit.labelKey)}
                      </span>
                    </div>
                  </td>
                  {days.map(day => {
                    const done    = isChecked(habit.id, day);
                    const isToday = day === today;
                    return (
                      <td key={day} style={{ textAlign: "center", padding: "10px 6px" }}>
                        <button
                          onClick={() => toggle(habit.id, day)}
                          disabled={!isToday}
                          style={{
                            width: 30, height: 30,
                            borderRadius: 8,
                            border: done ? "none" : `2px solid ${isToday ? "var(--border-hover)" : "var(--border)"}`,
                            background: done ? habit.bg : "transparent",
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            cursor: isToday ? "pointer" : "default",
                            opacity: !isToday && !done ? 0.3 : 1,
                            transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto",
                            transform: done ? "scale(1.05)" : "scale(1)",
                            boxShadow: done ? "0 3px 10px rgba(0,0,0,0.2)" : "none",
                          }}>
                          {done && <Image src="/icons/centang.svg" alt="" width={14} height={14} style={{ filter: F_WHITE }} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", opacity: 0.6,
                    textAlign: "center", padding: "10px 0 14px" }}>
          {t("onlyTodayEditable")}
        </p>
      </div>
    </div>
  );
}
