"use client";
import Image from "next/image";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const LOCALE_MAP = { en:"en-US", id:"id-ID", jp:"ja-JP", ko:"ko-KR", zh:"zh-CN", fr:"fr-FR", de:"de-DE" };

const F_MUTED  = "invert(57%) sepia(14%) saturate(520%) hue-rotate(192deg) opacity(0.75)";
const F_ACTIVE = "invert(46%) sepia(55%) saturate(560%) hue-rotate(204deg) brightness(108%)";

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { t, lang } = useApp();
  const now     = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel,   setSel]   = useState(null);
  const [notes, setNotes] = useState({});

  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());
  const locale   = LOCALE_MAP[lang] || "en-US";

  // Locale-aware month + year label
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(year, month));

  // DOW headers Mon→Sun — Jan 1 2024 was a Monday
  const DOW = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, i + 1))
  );

  function prev() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function next() { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); }

  function getCalDays() {
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    let dow = first.getDay(); if (dow === 0) dow = 7;
    const days = [];
    for (let i = dow - 1; i > 0; i--)
      days.push({ key: null, date: new Date(year, month, 1 - i), other: true });
    for (let d = 1; d <= last.getDate(); d++)
      days.push({ key: toKey(year, month, d), date: new Date(year, month, d), other: false });
    while (days.length % 7 !== 0) days.push({ key: null, other: true });
    return days;
  }

  const calDays = getCalDays();

  return (
    <div className="page-pad">

      <div className="mb-6 anim-fade-up">
        <h1 style={{ fontWeight: 900, fontSize: 26, color: "var(--text)", letterSpacing: "-0.4px",
                     display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/icons/kalender.svg" alt="" width={24} height={24} style={{ filter: F_ACTIVE, opacity: 0.85 }} />
          {t("calendarTitle")}
        </h1>
      </div>

      <div className="card anim-fade-up" style={{ animationDelay: "0.05s" }}>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={prev} className="btn-ghost"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center" }}>
            <Image src="/icons/panah-kiri.svg" alt="" width={20} height={20} style={{ filter: F_MUTED }} />
          </button>
          <h2 style={{ fontWeight: 800, color: "var(--text)", fontSize: 18, textTransform: "capitalize" }}>
            {monthLabel}
          </h2>
          <button onClick={next} className="btn-ghost"
                  style={{ padding: "8px 12px", display: "flex", alignItems: "center" }}>
            <Image src="/icons/panah-kanan.svg" alt="" width={20} height={20} style={{ filter: F_MUTED }} />
          </button>
        </div>

        {/* DOW headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {DOW.map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700,
                                  color: "var(--muted)", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {calDays.map((cell, i) => {
            if (cell.other) return <div key={i} />;
            const isToday = cell.key === todayKey;
            const isSel   = cell.key === sel;
            const hasNote = !!notes[cell.key];

            return (
              <button key={cell.key}
                      onClick={() => setSel(cell.key)}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 12,
                        border: `1.5px solid ${isSel ? "var(--accent)" : isToday ? "var(--accent)" : "var(--border)"}`,
                        background: isSel
                          ? "linear-gradient(135deg, var(--accent), var(--accent-lt))"
                          : isToday ? "var(--accent-dim)" : "var(--card)",
                        cursor: "pointer",
                        position: "relative",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "clamp(11px,2vw,13px)",
                        fontWeight: isSel || isToday ? 800 : 500,
                        color: isSel ? "#fff" : isToday ? "var(--accent-lt)" : "var(--text-soft)",
                        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                        boxShadow: isSel ? "var(--shadow-accent)" : "none",
                        transform: isSel ? "scale(1.05)" : "scale(1)",
                      }}
                      onMouseOver={e => { if (!isSel && !isToday) e.currentTarget.style.background = "var(--hover)"; }}
                      onMouseOut={e => { if (!isSel && !isToday) e.currentTarget.style.background = "var(--card)"; }}>
                {cell.date.getDate()}
                {hasNote && (
                  <div style={{ position: "absolute", bottom: 4, width: 5, height: 5,
                                borderRadius: "50%", background: "var(--success)" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes panel */}
      {sel && (
        <div className="card anim-scale-in mt-4">
          <h3 style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, marginBottom: 12,
                       display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/icons/edit.svg" alt="" width={15} height={15} style={{ filter: F_MUTED }} />
            {t("notesFor")} {sel}
          </h3>
          <textarea className="input"
                    style={{ resize: "none", height: 100, fontSize: 13 }}
                    placeholder={t("writeNote")}
                    value={notes[sel] || ""}
                    onChange={e => setNotes(p => ({ ...p, [sel]: e.target.value }))} />
        </div>
      )}
    </div>
  );
}
