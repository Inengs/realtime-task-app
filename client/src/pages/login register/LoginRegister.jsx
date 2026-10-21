import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (no external deps)                                */
/* ------------------------------------------------------------------ */
const LeafLogo = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path
      d="M21 3C13 3 7 6 4 12c-1 2-1 5 1 7 1.5 1.4 4 2 6 1.5 5-1.2 9-5 11-10.5.5-1.4.5-3.5-1-4.5C19 4.5 18 3 21 3Z"
      fill="currentColor"
    />
    <path
      d="M5 19c3-6 8-10 13-12"
      stroke="#fff"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M4 4l16 16" strokeLinecap="round" />
        <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.2-.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.27-4.74 3.27-7.94Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2-.04 1.6-.7 3-.7s1.8.7 3 .7c1.2-.02 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.03-.01-2.5-1-2.5-3.8ZM14.2 5.6c.6-.8 1.1-1.9.9-3-1 0-2.1.6-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3v-2.6c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.3 22H2l7.7-8.8L1 2h6.8l4.7 6.2L18.2 2Zm-1.2 18h1.8L7.1 4H5.2l11.8 16Z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Showcase cards (right panel)                                       */
/* ------------------------------------------------------------------ */
const DonutChart = ({ percent, color = "#5eead4", trackColor = "rgba(255,255,255,.15)" }) => {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg viewBox="0 0 56 56" className="w-14 h-14">
      <circle cx="28" cy="28" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {percent}%
      </text>
    </svg>
  );
};

const TodayCard = () => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-teal-200/80">Today's Plan</p>
        <p className="text-2xl font-bold text-white mt-1">8 tasks</p>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold">
        On track
      </span>
    </div>
    <div className="flex items-center gap-3">
      <DonutChart percent={62} />
      <div className="flex-1 space-y-1.5">
        {[
          { label: "Completed", val: "5", color: "bg-emerald-300" },
          { label: "In progress", val: "2", color: "bg-cyan-300" },
          { label: "Overdue", val: "1", color: "bg-rose-300" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[11px] text-white/80">
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            <span className="flex-1">{s.label}</span>
            <span className="font-semibold text-white">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PriorityCard = () => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl">
    <p className="text-[11px] uppercase tracking-widest text-teal-200/80 mb-2">Priority Tasks</p>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-semibold text-sm">Q4 Product Launch</p>
        <p className="text-white/60 text-[11px] mt-0.5">Due in 3 days · 4 members</p>
      </div>
      <p className="text-white text-lg font-bold">$1,900</p>
    </div>
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-white/70 mb-1">
        <span>Progress</span>
        <span>76%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: "76%" }} />
      </div>
    </div>
  </div>
);

const ProjectsCard = () => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 shadow-2xl">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] uppercase tracking-widest text-teal-200/80">Project Status</p>
      <p className="text-white text-lg font-bold">$17,366.00</p>
    </div>
    <div className="space-y-2.5">
      {[
        { name: "Website Redesign", pct: 82, hours: "32h" },
        { name: "Mobile App v2", pct: 64, hours: "48h" },
        { name: "Marketing Sprint", pct: 41, hours: "18h" },
      ].map((p) => (
        <div key={p.name}>
          <div className="flex justify-between text-[11px] text-white/85 mb-1">
            <span className="font-medium">{p.name}</span>
            <span className="text-white/60">{p.hours} · {p.pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
              style={{ width: `${p.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function LoginRegister() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await login({ email: formData.email, password: formData.password });
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setMessage(`Login failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setMessage(`Account created! Please check your email to verify.`);
      setTimeout(() => navigate("/verify-email"), 2000);
    } catch (err) {
      setMessage(`Registration failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const socials = [
    { name: "Google", Icon: GoogleIcon },
    { name: "Apple", Icon: AppleIcon },
    { name: "Facebook", Icon: FacebookIcon },
    { name: "X", Icon: XIcon },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT — form panel                                            */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col px-6 sm:px-10 lg:px-16 xl:px-20 py-8 lg:py-10 bg-white">
        {/* Header / logo */}
        <header className="flex items-center gap-2 text-emerald-600">
          <LeafLogo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Task<span className="text-emerald-600">Flow</span>
          </span>
        </header>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome to TaskFlow
            </h1>
            <p className="mt-2 text-slate-500 text-sm sm:text-base">
              {activeTab === "login"
                ? "Sign in to continue managing your tasks, or create a new account."
                : "Create your free account and start organizing your work in minutes."}
            </p>

            {/* Tabs */}
            <div className="mt-7 grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "login"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "register"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* ---------------- Login form ---------------- */}
            {activeTab === "login" && (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <Field
                  icon={<MailIcon />}
                  label="Email address"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="you@taskflow.app"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={<LockIcon />} label="Password">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </Field>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Remember me
                  </label>
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}

            {/* ---------------- Register form ---------------- */}
            {activeTab === "register" && (
              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <Field icon={<UserIcon />} label="Username">
                  <input
                    type="text"
                    name="username"
                    placeholder="janedoe"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={<MailIcon />} label="Email address">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@taskflow.app"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field icon={<LockIcon />} label="Password">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </Field>

                <Field icon={<LockIcon />} label="Confirm password">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}

            {/* Message */}
            {message && (
              <p
                className={`mt-4 text-center text-sm font-medium px-3 py-2 rounded-lg ${
                  message.includes("failed") || message.includes("do not match")
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {message}
              </p>
            )}

            {/* Divider */}
            <div className="mt-6 flex items-center gap-4">
              <span className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Or continue with
              </span>
              <span className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Socials */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              {socials.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`Continue with ${name}`}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100">
          <span>© 2026 TaskFlow. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-emerald-600 transition">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition">Support</a>
          </div>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* RIGHT — showcase panel                                        */}
      {/* ============================================================ */}
      <aside className="lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-10 min-h-[480px] lg:min-h-screen">
          {/* Top label */}
          <div className="mb-8 lg:mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-teal-200/80 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Live workspace preview
            </span>
          </div>

          {/* Cards stack */}
          <div className="space-y-4 max-w-md">
            <TodayCard />
            <PriorityCard />
            <ProjectsCard />
          </div>

          {/* Tagline */}
          <div className="mt-10 max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-300">
                <LeafLogo className="w-6 h-6" />
              </span>
              <span className="font-semibold tracking-tight">TaskFlow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              A Unified Hub for Smarter Task Management
            </h2>
            <p className="mt-2 text-sm text-teal-100/70 leading-relaxed">
              Plan, track, and ship work with your team — all in one beautiful workspace.
              Real-time updates, smart priorities, and insights that keep you ahead.
            </p>

            {/* Carousel indicators */}
            <div className="mt-6 flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-emerald-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable input field                                               */
/* ------------------------------------------------------------------ */
function Field({ icon, label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">{label}</span>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition">
        <span className="text-slate-400">{icon}</span>
        {children}
      </div>
    </label>
  );
}