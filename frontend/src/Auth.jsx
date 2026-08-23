import { createContext, useContext, useEffect, useState } from "react";

const API_URL = "https://contact-vault-api.onrender.com/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("contactVaultToken");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        return data;
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("contactVaultToken");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("contactVaultToken", data.token);

      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to login",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("contactVaultToken", data.token);

      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to register",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("contactVaultToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}