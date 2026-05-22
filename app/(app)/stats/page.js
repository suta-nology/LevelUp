"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import {
  Chart, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, ArcElement,
} from "chart.js";

Chart.register(
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, ArcElement
);

// Load chart components client-side only (no SSR)
const Bar      = dynamic(() => import("react-chartjs-2").then(m => ({ default: m.Bar      })), { ssr: false });
const Line     = dynamic(() => import("react-chartjs-2").then(m => ({ default: m.Line     })), { ssr: false });
const Doughnut = dynamic(() => import("react-chartjs-2").then(m => ({ default: m.Doughnut })), { ssr: false });

const WEEK_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "#3a3a5c" }, ticks: { color: "#64748b" } },
    y: { grid: { color: "#3a3a5c" }, ticks: { color: "#64748b" }, beginAtZero: true },
  },
};

function downloadCSV(filename, rows) {
  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function StatsPage() {
  const { t } = useApp();
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    const uid      = localStorage.getItem("lu_user") || "guest";
    const rawTodos = localStorage.getItem(`lu_todos_${uid}`);
    const todos    = rawTodos ? JSON.parse(rawTodos) : [];
    const rawHabit = localStorage.getItem(`lu_habits_${uid}`);
    const habits   = rawHabit ? JSON.parse(rawHabit) : {};

    // Build last-7-days data
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const habitsByDay = days.map(day =>
      Object.keys(habits).filter(k => k.endsWith(`_${day}`) && habits[k]).length
    );

    const tasksDone = todos.filter(t => t.done).length;
    const habitsRate = habitsByDay.reduce((a,b) => a+b, 0);
    const maxDay = habitsByDay.indexOf(Math.max(...habitsByDay));
    const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    setStatsData({
      taskData: {
        labels: WEEK_LABELS,
        datasets: [{
          label: "Habits Done",
          data: habitsByDay,
          backgroundColor: "rgba(99,102,241,0.7)",
          borderRadius: 8,
        }],
      },
      habitData: {
        labels: WEEK_LABELS,
        datasets: [{
          label: "Habits",
          data: habitsByDay,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.1)",
          tension: 0.4, fill: true,
          pointBackgroundColor: "#f59e0b",
        }],
      },
      donutData: {
        labels: ["Gym","Study","Water","Coding","Reading","Sleep"],
        datasets: [{
          data: days.map((day,_) => ["gym","study","water","coding","read","sleep"].map(id =>
            habits[`${id}_${day}`] ? 1 : 0
          )).reduce((acc, row) => acc.map((v,i) => v + row[i]), [0,0,0,0,0,0])
            .map(v => Math.round((v / 7) * 100)),
          backgroundColor: ["#ef4444","#6366f1","#06b6d4","#8b5cf6","#22c55e","#3b82f6"],
          borderWidth: 0,
        }],
      },
      summary: [
        { label: "Tasks Done",     value: tasksDone || "0",    icon: "✅", color: "text-emerald-400" },
        { label: "Total Tasks",    value: todos.length || "0", icon: "📋", color: "text-indigo-400"  },
        { label: "Habits This Week", value: habitsRate || "0", icon: "🔥", color: "text-orange-400"  },
        { label: "Best Habit Day", value: habitsRate > 0 ? DOW[maxDay] : "—", icon: "🏆", color: "text-yellow-400" },
      ],
      hasData: todos.length > 0 || habitsRate > 0,
    });
  }, []);

  return (
    <div className="p-5 md:p-8 max-w-4xl">

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>{t("statsTitle")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("statsSubtitle")}</p>
        </div>
        {/* CSV Export buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => {
              const uid  = localStorage.getItem("lu_user") || "guest";
              const raw  = localStorage.getItem(`lu_todos_${uid}`);
              const data = raw ? JSON.parse(raw) : [];
              downloadCSV("tasks.csv", [
                ["Task", "Status", "ID"],
                ...data.map(t => [t.text, t.done ? "Done" : "Active", t.id]),
              ]);
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:border-indigo-500 hover:text-indigo-400"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            📥 {t("exportTasks")}
          </button>
          <button
            onClick={() => {
              const uid  = localStorage.getItem("lu_user") || "guest";
              const raw  = localStorage.getItem(`lu_habits_${uid}`);
              const data = raw ? JSON.parse(raw) : {};
              const rows = [["Habit", "Date", "Completed"]];
              Object.entries(data).forEach(([key, val]) => {
                const [habit, date] = key.split("_");
                rows.push([habit, date, val ? "Yes" : "No"]);
              });
              downloadCSV("habits.csv", rows);
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:border-orange-500 hover:text-orange-400"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            📥 {t("exportHabits")}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {statsData && !statsData.hasData && (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-bold text-lg" style={{ color: "var(--text)" }}>{t("noDataYet")}</p>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("noDataDesc")}</p>
        </div>
      )}

      {statsData && statsData.hasData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsData.summary.map(({ label, value, icon, color }) => (
              <div key={label} className="card">
                <span className="text-2xl">{icon}</span>
                <p className={`text-2xl font-black mt-2 ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-bold text-white mb-4 text-sm">🔥 Habits Per Day</h2>
              <Bar data={statsData.taskData} options={CHART_OPTS} />
            </div>
            <div className="card">
              <h2 className="font-bold text-white mb-4 text-sm">📈 Habit Trend</h2>
              <Line data={statsData.habitData} options={{ ...CHART_OPTS, plugins: { legend: { display: false } } }} />
            </div>
            <div className="card md:col-span-2 flex flex-col md:flex-row items-center gap-8">
              <div className="w-52 flex-shrink-0">
                <Doughnut data={statsData.donutData} options={{
                  responsive: true,
                  plugins: { legend: { position: "right", labels: { color: "#94a3b8", boxWidth: 12 } } },
                  cutout: "70%",
                }} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-white mb-3 text-sm">🎯 Habit Completion Rate (7 days)</h2>
                {statsData.donutData.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                         style={{ background: statsData.donutData.datasets[0].backgroundColor[i] }} />
                    <span className="text-sm text-slate-300 flex-1">{label}</span>
                    <span className="text-sm font-bold text-slate-200">
                      {statsData.donutData.datasets[0].data[i]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!statsData && (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      )}
    </div>
  );
}
