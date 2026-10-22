import LeafSvg from "../../assets/images/logo-2.svg?react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Inline SVG "3D-style" abstract shapes (no external assets needed)  */
/* ------------------------------------------------------------------ */
const ChromeBlob = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <radialGradient id="chrome-g" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#e0fbf6" />
        <stop offset="55%" stopColor="#5eead4" />
        <stop offset="85%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#022c22" />
      </radialGradient>
      <radialGradient id="chrome-hi" cx="30%" cy="25%" r="20%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path
      d="M100 12c32-6 60 8 76 36 18 30 24 64 4 92-22 30-58 44-94 36-32-7-58-30-66-62-8-34 6-66 34-84 14-9 30-14 46-18Z"
      fill="url(#chrome-g)"
    />
    <ellipse cx="72" cy="60" rx="28" ry="20" fill="url(#chrome-hi)" />
  </svg>
);

const PinkOrb = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <radialGradient id="pink-g" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffe4f0" />
        <stop offset="40%" stopColor="#fb7ba5" />
        <stop offset="100%" stopColor="#9d174d" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="84" fill="url(#pink-g)" />
    <path
      d="M30 110c25-6 50-8 75-4s48 12 70 24"
      stroke="#fff"
      strokeWidth="3"
      fill="none"
      opacity="0.4"
      strokeLinecap="round"
    />
    <path
      d="M22 85c30-8 60-8 90 0s55 22 75 40"
      stroke="#fff"
      strokeWidth="2.5"
      fill="none"
      opacity="0.3"
      strokeLinecap="round"
    />
    <path
      d="M40 135c25-6 50-6 75 0s45 18 60 32"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      opacity="0.25"
      strokeLinecap="round"
    />
  </svg>
);

const BlackSwoosh = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <linearGradient id="black-g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f2937" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#000" />
      </linearGradient>
    </defs>
    <path
      d="M20 100c20-40 60-60 100-40 30 14 50 10 60-10 0 30-20 60-60 70s-90-2-100-20Z"
      fill="url(#black-g)"
    />
    <path
      d="M30 95c20-30 50-45 80-35"
      stroke="#5eead4"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
      strokeLinecap="round"
    />
  </svg>
);

const OrangeChunk = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <radialGradient id="orange-g" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="45%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#9a3412" />
      </radialGradient>
    </defs>
    <path
      d="M100 24c30-4 56 8 68 32 14 26 12 60-8 84-22 26-58 34-90 22-30-12-50-42-48-74 2-32 30-58 78-64Z"
      fill="url(#orange-g)"
    />
    <circle cx="78" cy="68" r="8" fill="#fff" opacity="0.5" />
    <circle cx="120" cy="120" r="4" fill="#fff" opacity="0.3" />
  </svg>
);

const CheckCube = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <linearGradient id="cube-w" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="#e5e7eb" />
      </linearGradient>
    </defs>
    <g transform="translate(100 100)">
      <path d="M0-70 60-35v70L0 70-60 35v-70Z" fill="#022c22" />
      <path d="M0-70 60-35 0 0-60-35Z" fill="url(#cube-w)" />
      <path d="M0 0 60-35v70L0 70Z" fill="#0f766e" />
      <path d="M0 0-60-35v70L0 70Z" fill="#064e3b" />
    </g>
  </svg>
);

const RedCone = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <linearGradient id="red-g" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fecaca" />
        <stop offset="40%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>
    <path d="M100 20 150 170H50Z" fill="url(#red-g)" />
    <ellipse cx="100" cy="170" rx="50" ry="10" fill="#000" opacity="0.3" />
  </svg>
);

const GreenCylinder = ({ className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden>
    <defs>
      <linearGradient id="cyl-g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="40%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="50" rx="50" ry="14" fill="#064e3b" />
    <rect x="50" y="50" width="100" height="100" fill="url(#cyl-g)" />
    <ellipse cx="100" cy="50" rx="50" ry="14" fill="#34d399" opacity="0.9" />
    <ellipse cx="100" cy="150" rx="50" ry="14" fill="#022c22" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Welcome page                                                       */
/* ------------------------------------------------------------------ */
export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <LeafSvg width={64} height={64} fill="#10b981" className="animate-pulse" />
          <span className="text-emerald-700 font-medium">Loading TaskFlow…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      {/* ---------------------------------------------------------- */}
      {/* Background grid + glow                                      */}
      {/* ---------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-emerald-400/30 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-cyan-400/25 rounded-full blur-[120px]" />

      {/* ---------------------------------------------------------- */}
      {/* Floating 3D-style shapes                                    */}
      {/* ---------------------------------------------------------- */}
      <ChromeBlob className="hidden md:block absolute top-[12%] left-[8%] w-40 h-40 lg:w-52 lg:h-52 drop-shadow-2xl animate-[float_8s_ease-in-out_infinite]" />
      <PinkOrb className="hidden md:block absolute top-[20%] left-[42%] w-24 h-24 lg:w-32 lg:h-32 drop-shadow-2xl animate-[float_6s_ease-in-out_infinite_0.5s]" />
      <BlackSwoosh className="hidden md:block absolute top-[60%] left-[14%] w-28 h-28 lg:w-36 lg:h-36 drop-shadow-2xl animate-[float_7s_ease-in-out_infinite_1s]" />
      <OrangeChunk className="hidden md:block absolute top-[8%] right-[18%] w-32 h-32 lg:w-44 lg:h-44 drop-shadow-2xl animate-[float_9s_ease-in-out_infinite_0.3s]" />
      <CheckCube className="hidden md:block absolute top-[48%] right-[8%] w-24 h-24 lg:w-32 lg:h-32 drop-shadow-2xl animate-[float_7.5s_ease-in-out_infinite_1.4s]" />
      <RedCone className="hidden md:block absolute bottom-[18%] right-[28%] w-20 h-28 lg:w-28 lg:h-36 drop-shadow-2xl animate-[float_6.5s_ease-in-out_infinite_0.8s]" />
      <GreenCylinder className="hidden md:block absolute bottom-[10%] left-[44%] w-20 h-28 lg:w-28 lg:h-36 drop-shadow-2xl animate-[float_8.5s_ease-in-out_infinite_1.2s]" />

      {/* ---------------------------------------------------------- */}
      {/* Nav bar                                                     */}
      {/* ---------------------------------------------------------- */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5">
        <div className="flex items-center gap-2 text-white">
          <LeafSvg width={28} height={28} fill="#5eead4" />
          <span className="text-xl font-bold tracking-tight">
            Task<span className="text-emerald-300">Flow</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#workflow" className="hover:text-white transition">Workflow</a>
          <a href="#community" className="hover:text-white transition">Community</a>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full bg-emerald-400 text-emerald-950 text-sm font-bold hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/30"
        >
          Get Started
        </button>
      </nav>

      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 pt-10 lg:pt-16 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-end">
          {/* Headline */}
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              The unified workspace for teams
            </span>
            <h1 className="text-white font-bold leading-[0.95] tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
              Calling all
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Task Legends.
              </span>
            </h1>
          </div>

          {/* Right intro text */}
          <div className="lg:col-span-4">
            <p className="text-white/80 text-base sm:text-lg leading-relaxed">
              TaskFlow brings together planners, creators, and teams who ship.
              We celebrate focus, flow, and the freedom of work done well —
              from quick checklists to deep team sprints. Join us. Plan. Ship.
              Grow together.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="max-w-7xl mx-auto mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-emerald-950 font-bold text-sm shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
          >
            Get Started — it's free
            <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
          >
            Already have an account? <span className="text-emerald-300">Sign In</span>
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Feature strip                                              */}
      {/* ---------------------------------------------------------- */}
      <section id="features" className="relative z-10 px-6 sm:px-10 lg:px-16 pb-20">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Plan", desc: "Tasks, sprints, and milestones in one place.", icon: "M4 6h16M4 12h16M4 18h10" },
            { title: "Track", desc: "Real-time progress on every project.", icon: "M3 12h4l3 8 4-16 3 8h4" },
            { title: "Ship", desc: "Hit deadlines without the chaos.", icon: "M5 12l5 5L20 7" },
            { title: "Grow", desc: "Insights that make your team better.", icon: "M3 17l6-6 4 4 8-8" },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-emerald-300/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="relative z-10 px-6 sm:px-10 lg:px-16 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© 2026 TaskFlow. Built for teams that ship.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>

      {/* Float keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
