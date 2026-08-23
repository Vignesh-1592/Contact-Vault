import { useState } from "react";
import { useAuth } from "./Auth";

export default function Login({ onRegister }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await login(
        form.email,
        form.password
      );

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape shape-one"></div>
      <div className="auth-background-shape shape-two"></div>

      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-logo">
            CV
          </div>

          <div className="auth-header">
            <h1>Contact Vault</h1>

            <p>
              Sign in to access your private contact vault
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="auth-footer">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              className="auth-link-button"
              onClick={onRegister}
            >
              Create an account
            </button>

          </div>

          <div className="secure-message">

            <span className="secure-icon">
              🔒
            </span>

            <span>
              Your contacts are private and secure
            </span>

          </div>

        </div>

        <p className="auth-copyright">
          © 2026 Contact Vault
        </p>

      </div>
    </div>
  );
}