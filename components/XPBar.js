"use client";
import { useApp } from "@/context/AppContext";

export default function XPBar({ compact = false }) {
  const { level, xpInfo, t } = useApp();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-black" style={{ color: "var(--accent)" }}>Lv.{level}</span>
        <div className="flex-1 h-1.5 progress-track" style={{ minWidth: 50 }}>
          <div className="progress-fill h-full" style={{ width: `${xpInfo.pct}%` }} />
        </div>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>{xpInfo.pct}%</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black" style={{ color: "var(--accent)" }}>
          {t("level")} {level}
        </span>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>
          {xpInfo.progress} / {xpInfo.needed} XP
        </span>
      </div>
      <div className="progress-track" style={{ height: 6 }}>
        <div className="progress-fill" style={{ height: "100%", width: `${xpInfo.pct}%` }} />
      </div>
    </div>
  );
}
