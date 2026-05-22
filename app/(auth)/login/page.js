"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.setItem("lu_user", cred.user.uid);
      localStorage.setItem("lu_name", cred.user.displayName || email.split("@")[0]);
      router.replace("/dashboard");
    } catch {
      setError("Incorrect email or password.");
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

        {/* Brand mark */}
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
