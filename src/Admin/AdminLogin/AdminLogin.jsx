// Import required dependencies
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./AdminLogin.css"; // Importing external CSS file for styling

const AdminLogin = () => {
  // State variables to store email, password, reCAPTCHA token, error message, and loading status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(""); // Store reCAPTCHA token
  const [error, setError] = useState("");// Error message storage
  const [loading, setLoading] = useState(false); // To handle loading state

  const navigate = useNavigate();// Hook for navigation
  const recaptchaRef = useRef(null); // Reference for reCAPTCHA

  // Redirect to admin home if already logged in
  useEffect(() => {
    const adminName = localStorage.getItem("adminName");
    if (adminName) {
      navigate("/admin-home");
    }
  }, [navigate]);

  // Function to handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();// Prevent default form submission behavior
    setError("");// Clear previous error messages
    setLoading(true); // Set loading state to true

    // Check if reCAPTCHA is completed
    if (!captchaToken) {
      setError("Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      // Sending login credentials to the server
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store admin data in localStorage
        localStorage.setItem("adminName", data.admin.adminName); 
        localStorage.setItem("adminEmail", data.admin.email);

        console.log("Stored Admin Name:",localStorage.getItem("adminName"));
        console.log("Stored Admin Email:",localStorage.getItem("adminEmail"));


        alert("Login successful!");// Show success message
        navigate("/admin-home");// Redirect to admin dashboard
      } else {
        // Handle login failure
        const errorData = await response.json();
        setError(errorData.message || "Invalid email or password.");
        recaptchaRef.current.reset();// Reset reCAPTCHA after failure
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server not reachable. Please try again later.");// Error message for network failure
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Welcome Back!</h2>
        <p>Please log in to your account</p>

        {/* Display error message if any */}
        {error && <p className="error-message">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading} // Disable input while loading
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading} // Disable input while loading
            />
          </div>

          {/* Google reCAPTCHA Component */}
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LenBvMqAAAAALN-DNzfq-TpKfRSru9kv4xuFIHg" // Replace with your actual reCAPTCHA site key
            onChange={(token) => setCaptchaToken(token)}
          />

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Redirect to Admin Registration Page */}
        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/admin-register" className="register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
