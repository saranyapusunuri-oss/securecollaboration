
"use client";

import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function Home() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [health, setHealth] = useState("Connecting...");

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data.message))
      .catch(() => setHealth("Backend connection failed"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Please wait...");

    const endpoint =
      mode === "register" ? "/api/register" : "/api/login";

    const body =
      mode === "register"
        ? { name, email, password }
        : { email, password };

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Something went wrong");
        return;
      }

      if (mode === "register") {
        setMessage("Registration successful! Please login.");
        setMode("login");
        setPassword("");
      } else {
        localStorage.setItem("access_token", data.access_token);
        setUser(data.user);
        setMessage("Login successful!");
      }
    } catch {
      setMessage("Cannot connect to backend.");
    }
  }

  async function checkAdmin() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API}/api/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setMessage(
        response.ok ? data.message : data.detail
      );
    } catch {
      setMessage("Admin request failed.");
    }
  }

  async function checkProfile() {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const profile = data.user;

        setMessage(
          `Profile verified! Welcome ${profile.name}. Email: ${profile.email}. Role: ${profile.role}`
        );
      } else {
        setMessage(data.detail || "Profile access failed");
      }
    } catch {
      setMessage("Cannot connect to backend.");
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
    setPassword("");
    setMessage("Logged out successfully.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "35px",
          borderRadius: "15px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 5px 25px #00000015",
        }}
      >
        <h1 style={{ color: "#173b70", textAlign: "center" }}>
          Secure Collaboration
        </h1>

        <p style={{ textAlign: "center", color: "#64748b" }}>
          Secure access to your workspace
        </p>

        <p style={{ textAlign: "center", fontSize: "13px" }}>
          Backend: {health}
        </p>

        {user ? (
          <div>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>

            <button onClick={checkProfile} style={buttonStyle}>
              Check My Profile
            </button>

            <button onClick={checkAdmin} style={buttonStyle}>
              Check Admin Access
            </button>

            <button
              onClick={logout}
              style={{
                ...buttonStyle,
                background: "#dc2626",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                margin: "25px 0",
              }}
            >
              <button
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                style={tabStyle(mode === "login")}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
                style={tabStyle(mode === "register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                style={inputStyle}
              />

              <button type="submit" style={buttonStyle}>
                {mode === "register" ? "Create Account" : "Login"}
              </button>
            </form>
          </>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#334155",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginBottom: "15px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "10px",
  background: "#173b70",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
};

function tabStyle(active) {
  return {
    flex: 1,
    padding: "11px",
    background: active ? "#173b70" : "#e2e8f0",
    color: active ? "white" : "#334155",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  };
}
