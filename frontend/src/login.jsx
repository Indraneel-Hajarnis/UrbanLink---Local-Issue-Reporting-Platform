import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // temporary logic (backend later)
    console.log("Email:", email);
    console.log("Password:", password);

    alert("Login submitted (connect backend later)");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>User Login</h2>
        <p className="subtitle">Report issues. Improve your city.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="register-link">
          Don’t have an account? <span><Link to={"/register"}>Register</Link></span>
        </p>
      </div>
    </div>
  );
};

export default Login;
