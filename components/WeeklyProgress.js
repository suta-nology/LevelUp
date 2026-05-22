"use client";
import { useEffect, useState } from "react";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function WeeklyProgress() {
  const [data, setData] = useState(Array(7).fill(0));

  useEffect(() => {
    const uid      = localStorage.getItem("lu_user") || "guest";
    const days     = getLast7Days();
    const rawHabit = localStorage.getItem(`lu_habits_${uid}`);
    const habits   = rawHabit ? JSON.parse(rawHabit) : {};
    const TOTAL    = 6;

    setData(days.map(day => {
      const done = Object.keys(habits).filter(k => k.endsWith(`_${day}`) && habits[k]).length;
      return TOTAL > 0 ? Math.round((done / TOTAL) * 100) : 0;
    }));
  }, []);

  const today = (new Date().getDay() + 6) % 7;

  return (
    <div className="space-y-2.5">
      {DAYS.map((day, i) => {
        const pct      = data[i];
        const isToday  = i === today;
        const isFuture = i > today;

        return (
          <div key={day} className="flex items-center gap-3">
            <span className="text-xs font-bold w-8 flex-shrink-0"
                  style={{ color: isToday ? "var(--accent-lt)" : "var(--muted)" }}>
              {day}
            </span>

            <div className="flex-1 h-2 progress-track">
              {!isFuture && pct > 0 && (
                <div className="progress-fill"
                     style={{
                       height: "100%",
                       width: `${pct}%`,
                       background: pct === 100
                         ? "linear-gradient(90deg, #34d399, #10b981)"
                         : isToday
                           ? "linear-gradient(90deg, var(--accent), var(--accent-lt))"
                           : "linear-gradient(90deg, var(--muted), var(--border-hover))",
                       animationDelay: `${i * 0.06}s`,
                     }} />
              )}
            </div>

            <span className="text-xs font-bold w-9 text-right flex-shrink-0"
                  style={{
                    color: isFuture || pct === 0 ? "var(--border-hover)"
                         : pct === 100 ? "var(--success)"
                         : isToday    ? "var(--accent-lt)"
                         : "var(--muted)",
                  }}>
              {isFuture ? "–" : `${pct}%`}
            </span>
          </div>
        );
      })}

      {data.every(v => v === 0) && (
        <p className="text-xs text-center pt-2" style={{ color: "var(--muted)", opacity: 0.7 }}>
          Complete habits to see your weekly progress
        </p>
      )}
    </div>
  );
}
