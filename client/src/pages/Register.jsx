import { useState, useEffect } from "react";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Register() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    [0, 1, 2, 3, 4].forEach((i) =>
      setTimeout(() => setStep((s) => Math.max(s, i + 1)), i * 100)
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user.username.trim() || !user.password.trim()) { setError("Please fill in all fields."); return; }
    if (user.username.trim().length < 3) { setError("Username must be at least 3 characters."); return; }
    if (user.password.trim().length < 3) { setError("Password must be at least 3 characters."); return; }
    setLoading(true);
    try {
      await registerUser({ username: user.username.trim(), password: user.password.trim() });
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      setError("Registration failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    const p = user.password;
    if (!p) return null;
    if (p.length < 4) return { label: "Weak", color: "#f87171", w: "28%", glow: "rgba(248,113,113,0.2)" };
    if (p.length < 7) return { label: "Fair", color: "#fbbf24", w: "60%", glow: "rgba(251,191,36,0.2)" };
    return { label: "Strong", color: "#34d399", w: "100%", glow: "rgba(52,211,153,0.2)" };
  };
  const strength = getStrength();

  const fadeUp = (i) => ({
    opacity: step > i ? 1 : 0,
    transform: step > i ? "translateY(0)" : "translateY(18px)",
    transition: "opacity 0.55s ease, transform 0.55s ease",
  });

  const isLight = theme === "light";

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    background: focused === field 
      ? (isLight ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.05)") 
      : (isLight ? "#f8fafc" : "rgba(255,255,255,0.03)"),
    border: focused === field
      ? "1px solid rgba(16,185,129,0.5)"
      : (isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.08)"),
    borderRadius: 10,
    color: isLight ? "#111827" : "#e8e8ff",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focused === field
      ? "0 0 0 3px rgba(16,185,129,0.1), 0 0 20px rgba(16,185,129,0.07)"
      : "none",
    transition: "all 0.25s ease",
  });

  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-25px,20px) scale(1.05); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-25px) scale(1.04); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-15px,-15px) scale(1.03); }
        }
        @keyframes borderShineGreen {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .blob1r { animation: float1 10s ease-in-out infinite; }
        .blob2r { animation: float2 12s ease-in-out infinite; }
        .blob3r { animation: float3 8s ease-in-out infinite; }
        .shine-border-green {
          background: linear-gradient(270deg, #10b981, #2563eb, #8b5cf6, #10b981);
          background-size: 300% 300%;
          animation: borderShineGreen 6s ease infinite;
        }
        input::placeholder { color: ${isLight ? "#94A3B8" : "#2e2e3a"}; }
        .btn-register:hover { filter: brightness(1.1); }
        .btn-register:active { transform: scale(0.98); }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isLight ? "#e2e8f0" : "#070710",
        position: "relative",
        overflow: "hidden",
        padding: 24,
      }}>

        {/* Blobs */}
        <div className="blob1r" style={{
          position: "absolute", bottom: "-10%", left: "-5%",
          width: 420, height: 420, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)" : "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div className="blob2r" style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 400, height: 400, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 65%)" : "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div className="blob3r" style={{
          position: "absolute", top: "35%", left: "15%",
          width: 260, height: 260, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 65%)" : "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Card */}
        <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

          {/* Logo */}
          <div style={{ ...fadeUp(0), textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 46, height: 46,
              borderRadius: 13,
              background: "linear-gradient(135deg, #10b981 0%, #2563eb 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              marginBottom: 18,
              boxShadow: isLight ? "0 0 32px rgba(16,185,129,0.15)" : "0 0 32px rgba(16,185,129,0.35), 0 8px 20px rgba(0,0,0,0.4)",
            }}>⏱</div>
            <h1 style={{
              color: isLight ? "#111827" : "#f1f1ff",
              fontSize: "1.55rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: "0 0 6px",
            }}>
              Create your account
            </h1>
            <p style={{ color: isLight ? "#4b5563" : "#4a4a6a", fontSize: "0.85rem", margin: 0 }}>
              Join Focus and boost your productivity
            </p>
          </div>

          {/* Animated border card */}
          <div style={{ ...fadeUp(1), borderRadius: 18, padding: 1.5 }} className="shine-border-green">
            <div style={{
              background: isLight ? "#ffffff" : "rgba(10,10,20,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 17,
              padding: "30px 28px 26px",
              position: "relative",
              overflow: "hidden",
              boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.03)" : "none",
            }}>
              {/* Sheen */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: isLight ? "linear-gradient(90deg,transparent,rgba(0,0,0,0.04),transparent)" : "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
              }} />

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Username */}
                <div style={fadeUp(2)}>
                  <label style={{
                    display: "block", color: isLight ? "#6B7280" : "#6b6b8a",
                    fontSize: "0.76rem", fontWeight: 600,
                    marginBottom: 7, letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Username
                  </label>
                  <input
                    placeholder="choose a username"
                    value={user.username}
                    autoComplete="username"
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("username")}
                  />
                </div>

                {/* Password */}
                <div style={fadeUp(3)}>
                  <label style={{
                    display: "block", color: isLight ? "#6B7280" : "#6b6b8a",
                    fontSize: "0.76rem", fontWeight: 600,
                    marginBottom: 7, letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="choose a password"
                      value={user.password}
                      autoComplete="new-password"
                      onChange={(e) => setUser({ ...user, password: e.target.value })}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle("password"), paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: isLight ? "#94A3B8" : "#3a3a5a", display: "flex", padding: 2,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#4B5563" : "#7c7ca0"}
                      onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#94A3B8" : "#3a3a5a"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {strength && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 3, background: isLight ? "#e5e7eb" : "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: strength.w,
                          background: strength.color,
                          borderRadius: 3,
                          boxShadow: `0 0 8px ${strength.glow}`,
                          transition: "width 0.4s ease, background 0.4s ease",
                        }} />
                      </div>
                      <span style={{
                        color: strength.color, fontSize: "0.72rem",
                        marginTop: 5, display: "block", fontWeight: 500,
                      }}>
                        {strength.label} password
                      </span>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10, padding: "10px 14px",
                    color: "#f87171", fontSize: "0.8rem", lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div style={fadeUp(4)}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-register"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      background: loading
                        ? "rgba(16,185,129,0.25)"
                        : "linear-gradient(135deg, #10b981 0%, #2563eb 100%)",
                      color: loading ? "#4a7a6a" : "#fff",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: loading ? "none" : "0 4px 18px rgba(16,185,129,0.3)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {loading
                      ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      : <UserPlus size={16} />
                    }
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            ...fadeUp(4),
            textAlign: "center",
            color: isLight ? "#6B7280" : "#3a3a5a",
            fontSize: "0.82rem",
            marginTop: 22,
          }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: isLight ? "#059669" : "#34a87a", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#047857" : "#6ee7b7"}
              onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#059669" : "#34a87a"}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;