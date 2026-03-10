"use client"
import { useState, FormEvent, CSSProperties } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) router.push("/dashboard")
    else setError("Invalid email or password. Please try again.")
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGrid} />
      <div style={styles.glowLeft} />
      <div style={styles.glowRight} />
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>⬡</div>
          <span style={styles.logoText}>TaskFlow</span>
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to access your dashboard</p>
        {error && <div style={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@taskflow.com"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)" }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
        <div style={styles.demoHint}>
          <p style={styles.demoTitle}>Demo credentials</p>
          <p style={styles.demoLine}>admin@taskflow.com / admin123</p>
          <p style={styles.demoLine}>sara@taskflow.com / sara123</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", position: "relative", overflow: "hidden", padding: "20px" },
  bgGrid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124,106,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.04) 1px, transparent 1px)", backgroundSize: "50px 50px" },
  glowLeft: { position: "absolute", top: "20%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)", filter: "blur(40px)" },
  glowRight: { position: "absolute", bottom: "10%", right: "-5%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)", filter: "blur(40px)" },
  card: { position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px", width: "100%", maxWidth: "420px", backdropFilter: "blur(20px)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" },
  logoRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" },
  logoIcon: { fontSize: "24px", color: "#7c6af7" },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "20px", color: "#fff", letterSpacing: "0.02em" },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" },
  subheading: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 32px", fontWeight: 300 },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#f87171", fontSize: "13px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif" },
  button: { background: "linear-gradient(135deg, #7c6af7 0%, #5b4fe0 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "16px", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "8px", transition: "transform 0.2s", fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em", boxShadow: "0 4px 20px rgba(124,106,247,0.3)" },
  demoHint: { marginTop: "28px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" },
  demoTitle: { color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" },
  demoLine: { color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: "2px 0", fontFamily: "monospace" },
}