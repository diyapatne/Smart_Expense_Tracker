import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchUser = async () => {

      const token =
        localStorage.getItem("token");

      if (!token) {

        setLoading(false);

        return;

      }

      try {

        const response =
          await api.get("/auth/me");

        setUser(response.data);

      } catch (error) {

        localStorage.removeItem("token");

        setUser(null);

      } finally {

        setLoading(false);

      }

    };

    fetchUser();

  }, []);

  const login = async (
    email,
    password
  ) => {

    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    const token =
      response.data.access_token;

    localStorage.setItem(
      "token",
      token
    );

    const userResponse =
      await api.get("/auth/me");

    setUser(
      userResponse.data
    );
  };

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,

        loading,

        login,

        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
}

export function useAuth() {

  return useContext(
    AuthContext
  );

}