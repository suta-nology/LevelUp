"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TRANSLATIONS } from "@/lib/i18n";
import {
  getLevel, getXPProgress, calcStreak,
  checkNewAchievements, ACHIEVEMENTS, XP, PENALTY,
} from "@/lib/gameSystem";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang,         setLangState]  = useState("en");
  const [theme,        setThemeState] = useState("dark");
  const [xp,           setXP]         = useState(0);
  const [unlocked,     setUnlocked]   = useState([]);
  const [toasts,       setToasts]     = useState([]);
  const [initialized,  setInitialized]= useState(false);

  /* ── Detect browser language → map to supported langs ── */
  function detectLang() {
    const SUPPORTED = { en:1, id:1, jp:1, ko:1, zh:1, fr:1, de:1 };
    // browser tag → our code
    const MAP = {
      id:"id", in:"id",           // Indonesian
      ja:"jp", jp:"jp",           // Japanese
      ko:"ko", kr:"ko",           // Korean
      zh:"zh", "zh-cn":"zh",      // Chinese
      "zh-tw":"zh", "zh-hk":"zh",
      fr:"fr",                    // French
      de:"de",                    // German
      en:"en",                    // English (default)
    };
    const langs = navigator.languages || [navigator.language || "en"];
    for (const raw of langs) {
      const code = raw.toLowerCase().split("-")[0];
      const full = raw.toLowerCase();
      if (MAP[full])  return MAP[full];
      if (MAP[code])  return MAP[code];
      if (SUPPORTED[code]) return code;
    }
    return "en";
  }

  /* ── Load from localStorage on mount ── */
  useEffect(() => {
    const uid        = localStorage.getItem("lu_user") || "guest";
    const stored     = localStorage.getItem("lu_lang");
    const savedLang  = stored || detectLang();       // auto-detect if no saved choice
    const savedTheme = localStorage.getItem("lu_theme") || "dark";
    const savedXP    = parseInt(localStorage.getItem(`lu_xp_${uid}`) || "0");
    const savedUnlocked = JSON.parse(localStorage.getItem(`lu_achievements_${uid}`) || "[]");

    setLangState(savedLang);
    setThemeState(savedTheme);
    setXP(savedXP);
    setUnlocked(savedUnlocked);
    setInitialized(true);
  }, []);

  /* ── Apply theme to <html> ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ── Translation helper ── */
  function t(key) {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
  }

  /* ── Language ── */
  function changeLang(newLang) {
    setLangState(newLang);
    localStorage.setItem("lu_lang", newLang);
  }

  /* ── Theme ── */
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("lu_theme", next);
  }

  /* ── Toast ── */
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  /* ── Add XP ── */
  function addXP(amount, reason) {
    setXP(prev => {
      const oldLvl = getLevel(prev);
      const newXP  = prev + amount;
      const newLvl = getLevel(newXP);

      const uid = localStorage.getItem("lu_user") || "guest";
      localStorage.setItem(`lu_xp_${uid}`, newXP.toString());

      addToast(`+${amount} XP — ${reason}`, "xp");

      if (newLvl > oldLvl) {
        setTimeout(() => addToast(`${TRANSLATIONS[lang]?.levelUp || "Level Up!"} ${TRANSLATIONS[lang]?.nowLevel || "Level"} ${newLvl} 🎉`, "levelup"), 500);
      }

      return newXP;
    });
  }

  /* ── Subtract XP (penalty) ── */
  function subtractXP(amount, reason) {
    setXP(prev => {
      const newXP = Math.max(0, prev - amount);
      const uid   = localStorage.getItem("lu_user") || "guest";
      localStorage.setItem(`lu_xp_${uid}`, newXP.toString());
      addToast(`-${amount} XP — ${reason}`, "penalty");
      return newXP;
    });
  }

  /* ── Daily penalty check (runs once per day after init) ── */
  useEffect(() => {
    if (!initialized) return;

    const uid = localStorage.getItem("lu_user") || "guest";
    if (uid === "guest") return;

    const today     = new Date().toISOString().slice(0, 10);
    const lastCheck = localStorage.getItem(`lu_penalty_check_${uid}`);
    if (lastCheck === today) return;

    localStorage.setItem(`lu_penalty_check_${uid}`, today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().slice(0, 10);

    const habitsRaw  = localStorage.getItem(`lu_habits_${uid}`);
    if (!habitsRaw) return;
    const habitsData = JSON.parse(habitsRaw);
    if (!Object.keys(habitsData).length) return;

    const HABIT_IDS    = ["gym", "study", "water", "coding", "read", "sleep"];
    const doneYesterday = HABIT_IDS.filter(id => habitsData[`${id}_${yDate}`]).length;

    if (doneYesterday === 0) {
      setTimeout(() => subtractXP(PENALTY.MISSED_DAY, TRANSLATIONS[lang]?.penaltyMissedDay || "Skipped all habits yesterday"), 1500);
    } else if (doneYesterday < 3) {
      setTimeout(() => subtractXP(PENALTY.LOW_HABITS, TRANSLATIONS[lang]?.penaltyLowHabits || "Low habit completion yesterday"), 1500);
    }
  }, [initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Unlock achievement ── */
  function unlockAchievement(achievementId, name, icon) {
    if (unlocked.includes(achievementId)) return;
    const uid     = localStorage.getItem("lu_user") || "guest";
    const updated = [...unlocked, achievementId];
    setUnlocked(updated);
    localStorage.setItem(`lu_achievements_${uid}`, JSON.stringify(updated));
    addToast(`${icon} ${t("achievementUnlocked")} ${name}`, "achievement");
  }

  /* ── Check achievements after any state change ── */
  function checkAchievements(stats) {
    const newOnes = checkNewAchievements(stats, unlocked);
    newOnes.forEach(a => {
      unlockAchievement(a.id, t(a.nameKey), a.icon);
    });
  }

  /* ── Notifications ── */
  async function requestNotifications() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    const result = await Notification.requestPermission();
    return result;
  }

  function sendNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }

  /* ── Computed ── */
  const xpInfo = getXPProgress(xp);
  const level  = xpInfo.level;

  return (
    <AppContext.Provider value={{
      lang, changeLang, t,
      theme, toggleTheme,
      xp, level, xpInfo,
      addXP, subtractXP,
      unlocked, checkAchievements,
      toasts, addToast, removeToast,
      requestNotifications, sendNotification,
      initialized,
      ACHIEVEMENTS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
