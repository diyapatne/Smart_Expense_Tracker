// src/pages/Dashboard.jsx

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Dashboard() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {

    logout();

    navigate("/login");

  };

  return (

    <div
      style={{
        maxWidth: "700px",

        margin: "80px auto",

        fontFamily: "sans-serif",

        textAlign: "center",
      }}
    >

      <h1>Welcome!</h1>

      <h3>
        {user?.full_name}
      </h3>

      <p>
        {user?.email}
      </p>

      <button
        onClick={handleLogout}
      >

        Logout

      </button>

    </div>

  );
}

export default Dashboard;