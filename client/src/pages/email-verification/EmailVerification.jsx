// EmailVerification.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

const EnvelopeGraphic = () => (
  <div className="relative w-28 h-28 mx-auto mb-6">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl rotate-6 opacity-20" />
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-4 border-white flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </div>
);

const Spinner = () => (
  <svg className="animate-spin w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const EmailVerificationPage = () => {
  const [message, setMessage] = useState("Check Your Email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setLoading(true);
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      setMessage(response.data.message || "Email verified successfully!");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Verification failed. Token may be invalid or expired."
      );
      setShowResendForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/resend-verification", { email });
      setMessage(
        response.data.message ||
          "Verification email resent. Please check your inbox."
      );
      setShowResendForm(false);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to resend verification email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute top-0 left-0 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-100/50 p-8 border border-emerald-50">
          <EnvelopeGraphic />

          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {message}
          </h2>

          {loading && (
            <div className="flex justify-center my-4">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
              {error}
            </div>
          )}

          {!searchParams.get("token") && !error && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed text-center">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
            </p>
          )}

          {showResendForm && (
            <form onSubmit={handleResend} className="mt-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email address
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    placeholder="you@taskflow.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {loading ? "Sending…" : "Resend Verification Email"}
              </button>
            </form>
          )}

          {!showResendForm && !searchParams.get("token") && (
            <button
              onClick={() => setShowResendForm(true)}
              className="mt-5 w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            >
              Didn't receive the email?
            </button>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-500 hover:text-emerald-600 font-medium inline-flex items-center gap-1.5 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>

        {/* helper note */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Tip: check your spam folder if you don't see the email within a minute.
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
