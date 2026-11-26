
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { BrainCircuit, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(email, password);

      const userData = response?.data?.user;
      const tokenData = response?.data?.token;

      if (!userData || !tokenData) {
        throw new Error("Backend response se user ya token nahi nikal paya!");
      }

      login(userData, tokenData);

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Page Error:", error);
      setError(error.message || "Invalid email or password");
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5">
            <BrainCircuit size={28} className="text-white" strokeWidth={2} />
          </div>

          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Email
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === "email"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              >
                <Mail size={20} strokeWidth={1.8} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Password
            </label>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === "password"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              >
                <Lock size={20} strokeWidth={1.8} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-emerald-500/10 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            {!loading && <ArrowRight size={18} strokeWidth={2} />}
          </button>
        </form>

        <div className="mt-8 text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 hover:text-emerald-700 font-semibold underline-offset-4 hover:underline transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
