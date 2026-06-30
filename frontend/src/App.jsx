// import Register from "./pages/Register";

// function App() {
//   return (
//     <Register />
//   );
// }

// export default App;


// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import PrivateRoute from "./components/PrivateRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//           {/* Default route — send people to dashboard, which will redirect to login if not authed */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;

// src/App.jsx
// src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";

import {

  AuthProvider,

} from "./context/AuthContext";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import PrivateRoute from "./components/PrivateRoute";
import UploadReceipt from "./pages/UploadReceipt";
import Expenses from "./pages/Expenses";
import EditExpense from "./pages/EditExpense";
import Insights from "./pages/Insights";
import SpendingCalendar from "./pages/SpendingCalendar";

function Navbar() {
  const location = useLocation();

  // Hide navbar on authentication pages
  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-blue-700">
        💳 Smart Expense Tracker
      </h1>

      <div className="flex gap-6 font-medium">
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-blue-600"
        >
          Dashboard
        </Link>

        <Link
          to="/calendar"
          className="text-gray-700 hover:text-blue-600"
        >
          Calendar
        </Link>

        <Link
          to="/upload-receipt"
          className="text-gray-700 hover:text-blue-600"
        >
          Upload Receipt
        </Link>

        <Link
          to="/expenses"
          className="text-gray-700 hover:text-blue-600"
        >
          Expenses
        </Link>

        <Link
          to="/insights"
          className="text-gray-700 hover:text-blue-600"
        >
          Insights
        </Link>
      </div>
    </nav>
  );
}

function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Navbar />
          
                  <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

  <Route
    path="/register"
    element={<Register />}
  />

  <Route
    path="/dashboard"
    element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    }
  />

  <Route
    path="/upload-receipt"
    element={
      <PrivateRoute>
        <UploadReceipt />
      </PrivateRoute>
    }
  />
<Route
    path="/insights"
    element={
        <PrivateRoute>
            <Insights />
        </PrivateRoute>
    }
/>
  <Route
    path="/"
    element={
      <Navigate
        to="/dashboard"
        replace
      />
    }
  />

<Route
  path="/calendar"
  element={
    <PrivateRoute>
      <SpendingCalendar />
    </PrivateRoute>
  }
/>


<Route path="/expenses" element={<Expenses />} />
<Route
    path="/edit-expense/:id"
    element={<EditExpense />}
/>

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

}

export default App;