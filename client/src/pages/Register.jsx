import { useState, useEffect } from "react";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import focusflowLogoDark from "../assets/focusflow-logo-dark.png";
import focusflowLogoLight from "../assets/focusflow-logo-light.png";

function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    [0, 1, 2, 3, 4, 5].forEach((i) =>
      setTimeout(() => setStep((s) => Math.max(s, i + 1)), i * 90)
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user.name.trim() || !user.email.trim() || !user.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (user.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(user.email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (user.password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password.trim()
      });
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      const serverMsg = err.response?.data?.message || err.response?.data;
      setError(typeof serverMsg === "string" ? serverMsg : "Registration failed. An account with this email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    const p = user.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "#f87171", w: "28%", glow: "rgba(248,113,113,0.2)" };
    if (p.length < 9) return { label: "Fair", color: "#fbbf24", w: "60%", glow: "rgba(251,191,36,0.2)" };
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
        .blob-g1 { animation: float1 10s ease-in-out infinite; }
        .blob-g2 { animation: float2 13s ease-in-out infinite; }
        .blob-g3 { animation: float3 15s ease-in-out infinite; }
        .shine-border-green {
          background: linear-gradient(270deg, #10b981, #06b6d4, #3b82f6, #10b981);
          background-size: 300% 300%;
          animation: borderShineGreen 6s ease infinite;
        }
        .btn-register:not(:disabled):hover {
          filter: brightness(1.1);
          box-shadow: 0 6px 24px rgba(16,185,129,0.45) !important;
        }
        input::placeholder { color: ${isLight ? "#94A3B8" : "#4a4a68"}; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isLight ? "#f1f5f9" : "#08080f",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Floating gradient orbs */}
        <div className="blob-g1" style={{
          position: "absolute", width: 440, height: 440, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          top: "8%", right: "12%", pointerEvents: "none",
        }} />
        <div className="blob-g2" style={{
          position: "absolute", width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
          bottom: "10%", left: "10%", pointerEvents: "none",
        }} />
        <div className="blob-g3" style={{
          position: "absolute", width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
          top: "50%", right: "38%", pointerEvents: "none",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: isLight
            ? "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)"
            : "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />

        {/* Main card wrapper */}
        <div style={{ width: "100%", maxWidth: 410, position: "relative", zIndex: 1 }}>

          {/* Logo & Header */}
          <div style={{ ...fadeUp(0), textAlign: "center", marginBottom: 24 }}>
            <img 
              src={isLight ? focusflowLogoLight : focusflowLogoDark} 
              alt="FocusFlow Logo" 
              className="w-14 h-14 rounded-2xl mx-auto mb-3.5 shadow-xl transition-transform hover:scale-105 duration-200"
            />
            <h1 style={{
              color: isLight ? "#111827" : "#f1f1ff",
              fontSize: "1.55rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: "0 0 6px",
            }}>
              Create your account
            </h1>
            <p style={{ color: isLight ? "#64748b" : "#6b7280", fontSize: "0.85rem", margin: 0 }}>
              Join FocusFlow and boost your daily productivity
            </p>
          </div>

          {/* Animated border card */}
          <div style={{ ...fadeUp(1), borderRadius: 18, padding: 1.5 }} className="shine-border-green">
            <div style={{
              background: isLight ? "#ffffff" : "rgba(10,10,20,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 17,
              padding: "26px 24px 22px",
              position: "relative",
              overflow: "hidden",
              boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.03)" : "none",
            }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }} noValidate>

                {/* Full Name */}
                <div style={fadeUp(2)}>
                  <label style={{
                    display: "block", color: isLight ? "#334155" : "#94a3b8",
                    fontSize: "0.76rem", fontWeight: 600,
                    marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Full Name
                  </label>
                  <input
                    placeholder="e.g. Alex Johnson"
                    value={user.name}
                    autoComplete="name"
                    spellCheck="false"
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("name")}
                  />
                </div>

                {/* Email Address */}
                <div style={fadeUp(3)}>
                  <label style={{
                    display: "block", color: isLight ? "#334155" : "#94a3b8",
                    fontSize: "0.76rem", fontWeight: 600,
                    marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={user.email}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("email")}
                  />
                </div>

                {/* Password */}
                <div style={fadeUp(4)}>
                  <label style={{
                    display: "block", color: isLight ? "#334155" : "#94a3b8",
                    fontSize: "0.76rem", fontWeight: 600,
                    marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase",
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={user.password}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
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
                        color: isLight ? "#94A3B8" : "#64748b", display: "flex", padding: 2,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#4B5563" : "#cbd5e1"}
                      onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#94A3B8" : "#64748b"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {strength && (
                    <div style={{ marginTop: 8 }}>
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
                        marginTop: 4, display: "block", fontWeight: 500,
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
                <div style={fadeUp(5)}>
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
                      color: loading ? "#a7f3d0" : "#fff",
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
            ...fadeUp(5),
            textAlign: "center",
            color: isLight ? "#6B7280" : "#64748b",
            fontSize: "0.82rem",
            marginTop: 22,
          }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: isLight ? "#059669" : "#34d399", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#047857" : "#6ee7b7"}
              onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#059669" : "#34d399"}
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
