import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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
      const res = await loginUser({ username: form.username.trim(), password: form.password });
      if (res.data.token) navigate("/");
      else setServerError("Login failed. Please check your credentials.");
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.status === 401
          ? "Incorrect username or password."
          : "Server unavailable. Please try again."
      );
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
        .login-btn:not(:disabled):active{transform:scale(0.97)}
      `}</style>

      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background: isLight ? "#e2e8f0" : "#070710",
        position:"relative", overflow:"hidden", padding:24,
      }}>
        {/* Blobs */}
        <div className="blob1" style={{position:"absolute",top:"-10%",left:"-5%",width:420,height:420,borderRadius:"50%",background: isLight ? "radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 65%)" : "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div className="blob2" style={{position:"absolute",bottom:"-15%",right:"-5%",width:480,height:480,borderRadius:"50%",background: isLight ? "radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 65%)" : "radial-gradient(circle,rgba(37,99,235,0.15) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div className="blob3" style={{position:"absolute",top:"40%",right:"20%",width:280,height:280,borderRadius:"50%",background: isLight ? "radial-gradient(circle,rgba(6,182,212,0.04) 0%,transparent 65%)" : "radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 65%)",pointerEvents:"none"}}/>

        <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>

          {/* Logo */}
          <div style={{...fadeUp(0),textAlign:"center",marginBottom:32}}>
            <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18,boxShadow:"0 0 32px rgba(124,58,237,0.4),0 8px 20px rgba(0,0,0,0.4)"}}>⏱</div>
            <h1 style={{color: isLight ? "#111827" : "#f1f1ff",fontSize:"1.55rem",fontWeight:700,letterSpacing:"-0.5px",margin:"0 0 6px"}}>Sign in to Focus</h1>
            <p style={{color: isLight ? "#4b5563" : "#4a4a6a",fontSize:"0.85rem",margin:0}}>Welcome back — let's get productive</p>
          </div>

          {/* Animated border card */}
          <div style={{...fadeUp(1),borderRadius:18,padding:1.5}} className="shine-border">
            <div style={{background: isLight ? "#ffffff" : "rgba(10,10,20,0.93)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:17,padding:"30px 28px 26px",position:"relative",overflow:"hidden",boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.03)" : "none"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,background: isLight ? "linear-gradient(90deg,transparent,rgba(0,0,0,0.04),transparent)" : "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)"}}/>

              <form
                onSubmit={handleSubmit}
                noValidate
                style={{display:"flex",flexDirection:"column",gap:16}}
              >
                {/* Username */}
                <div style={fadeUp(2)}>
                  <label htmlFor="login-username" style={{display:"block",color: isLight ? "#6B7280" : "#6b6b8a",fontSize:"0.76rem",fontWeight:600,marginBottom:7,letterSpacing:"0.07em",textTransform:"uppercase"}}>
                    Username
                  </label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="your username"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle("username")}
                  />
                  {errors.username && <span className="field-err">⚠ {errors.username}</span>}
                </div>

                {/* Password */}
                <div style={fadeUp(3)}>
                  <label htmlFor="login-password" style={{display:"block",color: isLight ? "#6B7280" : "#6b6b8a",fontSize:"0.76rem",fontWeight:600,marginBottom:7,letterSpacing:"0.07em",textTransform:"uppercase"}}>
                    Password
                  </label>
                  <div style={{position:"relative"}}>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="your password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle("password")}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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