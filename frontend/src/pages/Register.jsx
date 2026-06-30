import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profession, setProfession] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      Number(monthlyIncome) > 0 &&
      Number(monthlyBudget) > Number(monthlyIncome)
    ) {
      alert("Monthly budget cannot exceed monthly income.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email: email,
        password: password,

        profession: profession,
        monthly_income: Number(monthlyIncome),
        monthly_budget: Number(monthlyBudget),
      });

      alert("Registration successful!");

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8"
    >
      <h2 className="text-3xl font-bold text-center mb-6">
        Create Account
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block font-medium mb-2">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Profession
          </label>

          <select
            value={profession}
            onChange={(e) =>
              setProfession(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            required
          >
            <option value="">
              Select Profession
            </option>

            <option value="Student">
              🎓 Student
            </option>

            <option value="Salaried Employee">
              💼 Salaried Employee
            </option>

            <option value="Business Owner">
              🏢 Business Owner
            </option>

            <option value="Self-employed">
              👨‍💼 Self-employed
            </option>

            <option value="Freelancer">
              💻 Freelancer
            </option>

            <option value="Homemaker">
              🏠 Homemaker
            </option>

            <option value="Retired">
              👴 Retired
            </option>

            <option value="Other">
              🌍 Other
            </option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">
            Monthly Income (₹)
          </label>

          <input
            type="number"
            min="0"
            value={monthlyIncome}
            onChange={(e) =>
              setMonthlyIncome(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            placeholder="50000"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Monthly Budget (₹)
          </label>

          <input
            type="number"
            min="0"
            value={monthlyBudget}
            onChange={(e) =>
              setMonthlyBudget(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            placeholder="20000"
            required
          />

          <p className="text-xs text-gray-500 mt-1">
            This budget will personalize your calendar,
            spending insights and recommendations.
          </p>
        </div>

        <div>
          <label className="block font-medium mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-2"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>
      </form>

      <p className="text-center mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default Register;