import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import api from "../../services/api";

const EnvelopeIcon = () => (
  <div style={{ fontSize: "120px", color: "#4CAF50", marginBottom: "20px" }}>
    ✉️
  </div>
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
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setLoading(true);
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      setMessage(response.data.message || "Email verified successfully!");
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <EnvelopeIcon />
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "#333" }}>
          {message}
        </h2>

        {loading && (
          <p style={{ color: "#666", margin: "10px 0" }}>Processing...</p>
        )}

        {error && (
          <p
            style={{ color: "red", margin: "10px 0 20px 0", fontSize: "14px" }}
          >
            {error}
          </p>
        )}

        {!searchParams.get("token") && !error && (
          <p
            style={{ margin: "10px 0 20px 0", fontSize: "14px", color: "#666" }}
          >
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account.
          </p>
        )}

        {showResendForm && (
          <form onSubmit={handleResend} style={{ marginTop: "20px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
              disabled={loading}
            />
            <Button
              text={loading ? "Sending..." : "Resend Verification Email"}
              onClick={handleResend}
            />
          </form>
        )}

        {!showResendForm && !searchParams.get("token") && (
          <button
            onClick={() => setShowResendForm(true)}
            style={{
              marginTop: "10px",
              background: "none",
              border: "none",
              color: "#4CAF50",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Didn't receive the email?
          </button>
        )}

        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "15px",
            background: "none",
            border: "none",
            color: "#2196F3",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
