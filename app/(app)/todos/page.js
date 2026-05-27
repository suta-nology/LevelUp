"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { XP } from "@/lib/gameSystem";

const F_MUTED  = "invert(57%) sepia(14%) saturate(520%) hue-rotate(192deg) opacity(0.75)";
const F_DANGER = "invert(48%) sepia(68%) saturate(600%) hue-rotate(318deg) brightness(108%)";
const F_WHITE  = "brightness(0) invert(1)";

function uid() {
  return typeof window !== "undefined" ? (localStorage.getItem("lu_user") || "guest") : "guest";
}

export default function TodosPage() {
  const { t, addXP, checkAchievements } = useApp();

  const [tasks,  setTasks]  = useState([]);
  const [input,  setInput]  = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem(`lu_todos_${uid()}`);
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  function save(updated) {
    localStorage.setItem(`lu_todos_${uid()}`, JSON.stringify(updated));
    setTasks(updated);
  }

  function addTask() {
    if (!input.trim()) return;
    save([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  }

  function toggleTask(id) {
    const updated  = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    const task     = updated.find(t => t.id === id);
    const doneCount = updated.filter(t => t.done).length;
    save(updated);

    if (task?.done) {
      addXP(XP.TASK_DONE, t("taskComplete"));
      checkAchievements({ tasksCompleted: doneCount, streak: 0, perfectDays: 0, level: 0 });
    }
  }

  function deleteTask(id) { save(tasks.filter(t => t.id !== id)); }

  const filtered  = tasks.filter(tk =>
    filter === "all" ? true : filter === "active" ? !tk.done : tk.done
  );
  const doneCount = tasks.filter(tk => tk.done).length;
  const pct       = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="page-pad">
      <div className="mb-6 anim-fade-up">
        <h1 style={{ fontWeight: 900, fontSize: 26, color: "var(--text)", letterSpacing: "-0.4px" }}>
          {t("todos")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          {tasks.length === 0 ? t("emptyTaskSub") : `${doneCount} / ${tasks.length} ${t("done").toLowerCase()}`}
        </p>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="progress-track anim-fade-up mb-5" style={{ height: 6 }}>
          <div className="progress-fill" style={{ height: "100%", width: `${pct}%` }} />
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-5 anim-fade-up" style={{ animationDelay: "0.05s" }}>
        <input className="input flex-1" placeholder={t("addTask")}
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === "Enter" && addTask()} />
        <button onClick={addTask} className="btn-primary"
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Image src="/icons/tambah.svg" alt="" width={14} height={14} style={{ filter: F_WHITE }} />
          {t("add")}
        </button>
      </div>

      {/* Filter pills */}
      {tasks.length > 0 && (
        <div className="flex gap-2 mb-4 anim-fade-up" style={{ animationDelay: "0.08s" }}>
          {["all","active","done"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
                    className={`filter-btn ${filter === f ? "active" : ""}`}>
              {t(f)}
            </button>
          ))}
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-2 stagger">
        {tasks.length === 0 && (
          <div className="anim-fade-up text-center py-16">
            <div style={{ marginBottom: 12, opacity: 0.35 }}>
              <Image src="/icons/centang.svg" alt="" width={48} height={48} style={{ filter: F_MUTED }} />
            </div>
            <p style={{ fontWeight: 600, color: "var(--text-soft)" }}>{t("emptyTaskTitle")}</p>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{t("emptyTaskSub")}</p>
          </div>
        )}

        {filtered.map((task, i) => (
          <div key={task.id}
               className="anim-fade-up flex items-center gap-3 px-4 py-3 rounded-2xl"
               style={{
                 animationDelay: `${i * 0.04}s`,
                 background:     task.done ? "var(--hover)" : "var(--card)",
                 border:         `1px solid ${task.done ? "var(--border)" : "var(--border)"}`,
                 opacity:        task.done ? 0.65 : 1,
                 transition:     "all 0.2s ease",
               }}
               onMouseOver={e => { if (!task.done) e.currentTarget.style.borderColor = "var(--accent)"; }}
               onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>

            {/* Checkbox */}
            <button onClick={() => toggleTask(task.id)}
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: `2px solid ${task.done ? "var(--success)" : "var(--border-hover)"}`,
                      background: task.done ? "var(--success)" : "transparent",
                      color: "#fff", fontSize: 11, fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }}>
              {task.done && <Image src="/icons/centang.svg" alt="" width={11} height={11} style={{ filter: F_WHITE }} />}
            </button>

            {/* Text */}
            <span className="flex-1 text-sm"
                  style={{
                    color: task.done ? "var(--muted)" : "var(--text)",
                    textDecoration: task.done ? "line-through" : "none",
                    fontWeight: task.done ? 400 : 500,
                    transition: "all 0.2s",
                  }}>
              {task.text}
            </span>

            {/* Delete */}
            <button onClick={() => deleteTask(task.id)}
                    style={{ background: "none", border: "none", cursor: "pointer",
                             padding: "4px", borderRadius: 6, display: "flex", alignItems: "center" }}
                    onMouseOver={e => { const img = e.currentTarget.querySelector("img"); if (img) img.style.filter = F_DANGER; }}
                    onMouseOut={e => { const img = e.currentTarget.querySelector("img"); if (img) img.style.filter = F_MUTED; }}>
              <Image src="/icons/hapus.svg" alt="" width={16} height={16}
                     style={{ filter: F_MUTED, transition: "filter 0.15s", display: "block" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
