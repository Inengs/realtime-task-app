import LeafSvg from "../../assets/images/logo-2.svg?react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

function IntroHeader() {
  return <h1 className="text-3xl text-gray-800 font-bold">TaskFlow</h1>;
}

const LeafIcon = ({ size = 100, color = "green" }) => (
  <LeafSvg
    width={size}
    height={size}
    fill={color}
    className="mb-4 animate-bounce"
    aria-label="TaskFlow leaf logo"
  />
);

function IntroText() {
  return (
    <span className="text-lg text-gray-400 font-medium">
      Manage tasks Effortlessly
    </span>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-4 max-w-md mx-auto px-4">
      <LeafIcon size={120} color="#4ade80" />
      <IntroHeader />
      <IntroText />

      <button
        onClick={() => navigate("/login")}
        className="w-full max-w-xs px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg"
      >
        Get Started
      </button>

      <button
        className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        onClick={() => navigate("/login")}
      >
        Already have an account?{" "}
        <span className="text-green-600 font-semibold">Sign In</span>
      </button>
    </div>
  );
}
