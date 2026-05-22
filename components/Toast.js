"use client";
import { useApp } from "@/context/AppContext";

const STYLES = {
  xp:          { bg: "var(--accent)",   border: "rgba(124,106,240,0.5)", icon: "⚡" },
  levelup:     { bg: "#ca8a04",         border: "#fbbf24",               icon: "🎉" },
  achievement: { bg: "#7c3aed",         border: "#a78bfa",               icon: "🏆" },
  success:     { bg: "#059669",         border: "#34d399",               icon: "✅" },
  error:       { bg: "#dc2626",         border: "#f87171",               icon: "❌" },
  info:        { bg: "var(--surface)",  border: "var(--border)",         icon: "ℹ️" },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed z-50 flex flex-col gap-2 items-end"
         style={{ bottom: "88px", right: "16px" }}
         /* above mobile bottom nav */
    >
      {toasts.map(toast => {
        const s = STYLES[toast.type] || STYLES.info;
        return (
          <div key={toast.id}
               onClick={() => removeToast(toast.id)}
               className="anim-toast flex items-center gap-3 cursor-pointer select-none"
               style={{
                 background: s.bg,
                 border: `1px solid ${s.border}`,
                 borderRadius: 16,
                 padding: "10px 16px",
                 maxWidth: 300,
                 boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                 color: "#fff",
                 fontSize: 13,
                 fontWeight: 600,
               }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
