import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function LoginRegister() {
  const [activeTab, setActiveTab] = useState("login");
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

  // Handle Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setMessage(`Login failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register submit
  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Validate password match
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setMessage(`Account created! Please check your email to verify.`);

      // ✅ Option 1: Redirect to email verification page
      setTimeout(() => navigate("/verify-email"), 2000);

      // ✅ Option 2 (alternative): Auto-login and redirect to dashboard
      // await login({
      //     email: formData.email,
      //     password: formData.password,
      // });
      // setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setMessage(
        `Registration failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-2 text-lg font-semibold rounded-t-xl ${
              activeTab === "login"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-1/2 py-2 text-lg font-semibold rounded-t-xl ${
              activeTab === "register"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <a
              href="#"
              className="text-sm text-blue-500 text-center hover:underline"
            >
              Forgot password?
            </a>
          </form>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <form className="flex flex-col space-y-4" onSubmit={handleRegister}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Response Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.includes("failed") || message.includes("do not match")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
