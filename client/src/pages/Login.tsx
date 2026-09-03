import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Couldn't log you in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blush-50 via-cream-50 to-lavender-50 dark:from-[#1a1525] dark:via-[#1f1830] dark:to-[#1a1525]">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2 animate-float">🌸</div>
          <h1 className="font-display font-extrabold text-2xl text-gray-700 dark:text-gray-50">
            Daily<span className="text-blush-500">Tracker</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, lovely! Let's get productive ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 text-sm p-3 rounded-2xl">
              {error}
            </div>
          )}
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p className="text-center text-sm text-gray-400">
            New here?{" "}
            <Link to="/register" className="text-blush-500 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demo login: <span className="font-mono">demo@dailytracker.app</span> / <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
}
