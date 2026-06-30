import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12">

        <div className="max-w-md">

          <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
            Smart Receipt
            <br />
            Expense Tracker
          </h1>

          <p className="text-gray-600 text-lg mb-10">
            AI-powered personal finance management.
          </p>

          <div className="space-y-6">

            <div className="flex items-center gap-4">
              <div className="text-3xl">🧾</div>
              <div>
                <h3 className="font-semibold">
                  AI Receipt Scanner
                </h3>
                <p className="text-gray-500 text-sm">
                  Upload receipts and automatically extract expenses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl">📅</div>
              <div>
                <h3 className="font-semibold">
                  Spending Calendar
                </h3>
                <p className="text-gray-500 text-sm">
                  Visualize daily expenses with heatmaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="font-semibold">
                  Smart Insights
                </h3>
                <p className="text-gray-500 text-sm">
                  Discover spending trends using AI.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="flex-1 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

          <h2 className="text-3xl font-bold text-center mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Login to continue managing your expenses.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />

            </div>

            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>

          </form>

          <p className="text-center mt-6 text-gray-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;