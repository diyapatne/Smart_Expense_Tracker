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

} from "react-router-dom";

import {

  AuthProvider,

} from "./context/AuthContext";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import PrivateRoute from "./components/PrivateRoute";
import UploadReceipt from "./pages/UploadReceipt";

function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <nav className="flex gap-4 border-b border-gray-200 px-6 py-4">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            to="/upload-receipt"
            className="text-gray-700 hover:text-blue-600"
          >
            Upload Receipt
          </Link>
        </nav>

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
    path="/"
    element={
      <Navigate
        to="/dashboard"
        replace
      />
    }
  />


        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

}

export default App;