"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !pass) { setError("Please fill in all fields."); return; }
    if (pass.length < 6)          { setError("Password must be at least 6 characters."); return; }
    if (pass !== confirm)          { setError("Passwords do not match."); return; }

    setLoading(true); setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, role: "free", createdAt: serverTimestamp(),
      });
      localStorage.setItem("lu_user", cred.user.uid);
      localStorage.setItem("lu_name", name);
      router.replace("/dashboard");
    } catch (e) {
      setError(e.code === "auth/email-already-in-use"
        ? "Email already registered." : "Registration failed. Try again.");
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
            Start your journey today.
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 20 }}>
            Create Account
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
              <label className="label">Display Name</label>
              <input className="input" type="text" placeholder="Your name"
                     value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@email.com"
                     value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters"
                     value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password"
                     value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full"
                    style={{ marginTop: 4 }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 18 }}>
            Already have an account?{" "}
            <Link href="/login"
                  style={{ color: "var(--accent-lt)", fontWeight: 700, textDecoration: "none" }}>
              Sign In →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
