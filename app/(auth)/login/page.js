"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email,         setEmail]         = useState("");
  const [pass,          setPass]          = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  /* Load saved email on mount */
  useEffect(() => {
    const saved = localStorage.getItem("lu_saved_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (rememberEmail) {
        localStorage.setItem("lu_saved_email", email);
      } else {
        localStorage.removeItem("lu_saved_email");
      }
      localStorage.setItem("lu_user", cred.user.uid);
      localStorage.setItem("lu_name", cred.user.displayName || email.split("@")[0]);
      router.replace("/dashboard");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true); setError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const uid  = cred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", uid), {
          name: cred.user.displayName || "User",
          email: cred.user.email,
          role: "free",
          createdAt: serverTimestamp(),
        });
      }
      localStorage.setItem("lu_user", uid);
      localStorage.setItem("lu_name", cred.user.displayName || cred.user.email.split("@")[0]);
      router.replace("/dashboard");
    } catch {
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      background: "radial-gradient(ellipse at 30% 20%, rgba(124,106,240,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.1) 0%, transparent 50%), var(--bg)",
    }}>
      <div className="w-full anim-scale-in" style={{ maxWidth: 380 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, var(--accent), var(--accent-lt))",
            borderRadius: 20, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 28, margin: "0 auto 16px",
            boxShadow: "0 8px 32px var(--accent-glow)",
          }}>⚡</div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: "var(--text)", letterSpacing: "-0.5px" }}>
            LevelUp
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
            Level up your life, every day.
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 20 }}>
            Sign In
          </h2>

          {error && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 12, padding: "10px 14px",
              color: "var(--danger)", fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%", padding: "11px 16px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontSize: 14, fontWeight: 600, color: "var(--text)",
              transition: "border-color 0.2s",
              marginBottom: 16,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@email.com"
                     value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                     value={pass} onChange={e => setPass(e.target.value)} />
            </div>

            {/* Remember email checkbox */}
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", fontSize: 13, color: "var(--muted)",
            }}>
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={e => setRememberEmail(e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
              />
              Remember my email
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full"
                    style={{ marginTop: 4 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 18 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register"
                  style={{ color: "var(--accent-lt)", fontWeight: 700, textDecoration: "none" }}>
              Register →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
