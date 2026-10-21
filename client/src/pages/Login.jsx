import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import focusflowLogoDark from "../assets/focusflow-logo-dark.png";
import focusflowLogoLight from "../assets/focusflow-logo-light.png";

function Login() {
  const [form, setForm]               = useState({ username: "", password: "" });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState(null);
  const [step, setStep]               = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { switchUser } = useApp();

  // Stagger entrance
  useEffect(() => {
    [0,1,2,3,4].forEach((i) =>
      setTimeout(() => setStep((s) => Math.max(s, i + 1)), i * 110)
    );
  }, []);

  // ── Inline validation ──────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.username.trim())          e.username = "Username is required.";
    else if (form.username.trim().length < 3) e.username = "Min 3 characters.";
    if (!form.password)                 e.password = "Password is required.";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear field error as user types
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    if (serverError)   setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    setLoading(true);
    setServerError("");
    try {
      const res = await loginUser({ username: form.username.trim(), password: form.password.trim() });
      if (res.data.token) {
        if (switchUser) switchUser(res.data.username || form.username.trim());
        navigate("/");
      } else {
        setServerError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setServerError("Incorrect username or password.");
      } else if (!err.response) {
        setServerError("Cannot reach backend server. Please check your network connection.");
      } else {
        setServerError(err.response?.data?.message || err.response?.data || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const fadeUp = (i) => ({
    opacity:   step > i ? 1 : 0,
    transform: step > i ? "translateY(0)" : "translateY(16px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  });

  const isLight = theme === "light";

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    paddingRight: field === "password" ? 42 : 14,
    background: errors[field]
      ? "rgba(239,68,68,0.05)"
      : focused === field 
        ? (isLight ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.06)") 
        : (isLight ? "#f8fafc" : "rgba(255,255,255,0.03)"),
    border: errors[field]
      ? "1px solid rgba(239,68,68,0.45)"
      : focused === field
        ? "1px solid rgba(124,58,237,0.55)"
        : (isLight ? "1px solid #cbd5e1" : "1px solid rgba(255,255,255,0.08)"),
    borderRadius: 10,
    color: isLight ? "#111827" : "#e8e8ff",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: errors[field]
      ? "0 0 0 3px rgba(239,68,68,0.08)"
      : focused === field
        ? "0 0 0 3px rgba(124,58,237,0.12)"
        : "none",
    transition: "all 0.22s ease",
  });

  return (
    <>
      <style>{`
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(1.04)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,15px) scale(1.03)} }
        @keyframes borderShine { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)} }
        @keyframes errIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .blob1{animation:float1 9s ease-in-out infinite}
        .blob2{animation:float2 11s ease-in-out infinite}
        .blob3{animation:float3 13s ease-in-out infinite}
        .shine-border{background:linear-gradient(270deg,#7c3aed,#2563eb,#06b6d4,#7c3aed);background-size:300% 300%;animation:borderShine 5s ease infinite}
        .shake{animation:shake 0.35s ease}
        .field-err{animation:errIn 0.2s ease forwards;color:#f87171;font-size:0.73rem;margin-top:5px;display:block}
        input::placeholder{color: ${isLight ? "#94A3B8" : "#2e2e3a"}}
        .login-btn{transition:all 0.2s ease}
        .login-btn:not(:disabled):hover{filter:brightness(1.12);box-shadow:0 6px 24px rgba(124,58,237,0.5)!important}
      `}</style>

      {/* Outer viewport */}
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

        {/* Ambient background glows */}
        <div className="blob1" style={{position:"absolute",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.14) 0%,transparent 70%)",top:"10%",left:"15%",pointerEvents:"none"}}/>
        <div className="blob2" style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)",bottom:"12%",right:"12%",pointerEvents:"none"}}/>
        <div className="blob3" style={{position:"absolute",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)",top:"55%",left:"40%",pointerEvents:"none"}}/>

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: isLight
            ? "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)"
            : "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}/>

        {/* Card wrapper */}
        <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>

          {/* Logo & Header */}
          <div style={{...fadeUp(0),textAlign:"center",marginBottom:28}}>
            <img 
              src={isLight ? focusflowLogoLight : focusflowLogoDark} 
              alt="FocusFlow Logo" 
              className="w-14 h-14 rounded-2xl mx-auto mb-3.5 shadow-xl transition-transform hover:scale-105 duration-200"
            />
            <h1 style={{color: isLight ? "#0f172a" : "#fff",fontWeight:800,fontSize:"1.55rem",margin:"0 0 6px",letterSpacing:"-0.03em"}}>
              Welcome back
            </h1>
            <p style={{color: isLight ? "#64748b" : "#4a4a68",fontSize:"0.84rem",margin:0}}>
              Sign in to continue your focus journey
            </p>
          </div>

          {/* Animated card border */}
          <div style={{...fadeUp(1),padding:1,borderRadius:18}} className="shine-border">
            <div style={{
              background: isLight ? "#ffffff" : "#0d0d18",
              borderRadius: 17,
              padding: "26px 22px",
              boxShadow: isLight ? "0 10px 25px -5px rgba(0, 0, 0, 0.05)" : "none",
            }}>
              <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:15}} noValidate>

                {/* Username */}
                <div style={fadeUp(2)}>
                  <label style={{display:"block",color: isLight ? "#334155" : "#6a6a8a",fontSize:"0.76rem",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:7}}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={form.username}
                    placeholder="Enter your username"
                    onChange={(e) => handleChange("username", e.target.value)}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("username")}
                  />
                  {errors.username && <span className="field-err">⚠ {errors.username}</span>}
                </div>

                {/* Password */}
                <div style={fadeUp(3)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                    <label style={{color: isLight ? "#334155" : "#6a6a8a",fontSize:"0.76rem",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                      Password
                    </label>
                  </div>
                  <div style={{position:"relative"}}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      value={form.password}
                      placeholder="••••••••"
                      onChange={(e) => handleChange("password", e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color: isLight ? "#94A3B8" : "#3a3a5a",display:"flex",padding:2,transition:"color 0.2s"}}
                      onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#4B5563" : "#7c7ca0"}
                      onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#94A3B8" : "#3a3a5a"}
                    >
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {errors.password && <span className="field-err">⚠ {errors.password}</span>}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="shake" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.22)",borderRadius:10,padding:"10px 14px",color:"#f87171",fontSize:"0.82rem",lineHeight:1.5}}>
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <div style={{...fadeUp(4),marginTop:4}}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="login-btn"
                    style={{
                      width:"100%",padding:"12px",borderRadius:10,border:"none",
                      cursor: loading ? "not-allowed" : "pointer",
                      background: loading ? "rgba(124,58,237,0.25)" : "linear-gradient(135deg,#7c3aed,#2563eb)",
                      color: loading ? "#5a5a8a" : "#fff",
                      fontWeight:600,fontSize:"0.9rem",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      boxShadow: loading ? "none" : "0 4px 18px rgba(124,58,237,0.38)",
                      opacity: loading ? 0.75 : 1,
                    }}
                  >
                    {loading
                      ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>
                      : <ArrowRight size={16}/>
                    }
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Footer */}
          <p style={{...fadeUp(4),textAlign:"center",color: isLight ? "#6B7280" : "#3a3a5a",fontSize:"0.82rem",marginTop:22}}>
            Don't have an account?{" "}
            <Link to="/register" style={{color: isLight ? "#7c3aed" : "#7c5dc7",textDecoration:"none",fontWeight:600}}
              onMouseEnter={(e) => e.currentTarget.style.color = isLight ? "#6d28d9" : "#a78bfa"}
              onMouseLeave={(e) => e.currentTarget.style.color = isLight ? "#7c3aed" : "#7c5dc7"}
            >Create one →</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
