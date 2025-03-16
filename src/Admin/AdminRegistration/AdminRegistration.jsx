// Import required dependencies
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";// reCAPTCHA for bot prevention
import logo from "../../images/logo.webp";// Importing logo image
import "./AdminRegistration.css";// Importing CSS for styling

// Defining the AdminRegistration component
const AdminRegistration = () => {
  // State to store form input values
  const [formData, setFormData] = useState({
    adminName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(null); // Tracks password match status
  const [captchaToken, setCaptchaToken] = useState(null);// store reCAPTCHA token

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Checking if passwords match in real time
    if (name === "confirmPassword" || name === "password") {
      setPasswordMatch(
        name === "confirmPassword" && value === formData.password
      );
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if passwords match
    if (!passwordMatch) {
      alert("Passwords do not match!");
      return;
    }

    // Validation: Ensure reCAPTCHA is completed
    if (!captchaToken) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      // Sending registration data to the server
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password,
          captchaToken,//send reCAPTCHA token for verification
        }),
      });

      if (response.ok) {
        alert("Admin registered successfully!");
        // Resetting form fields after successful registration
        setFormData({
          adminName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        alert("Error registering admin.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server not reachable.");
    }
  };

  return (
    <div className="admin-registration-page">
      {/* Logo Section */}
      <div className="logo-section">
        <img src={logo} alt="Admin Portal Logo" className="logo-image" />
      </div>
      {/* Registration Form Section */}
      <div className="form-section">
        <h2>Welcome to Fresh Start Hub!</h2>
        <p>Register your admin account</p>
        {/* Registration Form */}
        <form className="admin-registration-form" onSubmit={handleSubmit}>
          <label>
            Admin Name
            <input
              type="text"
              name="adminName"
              placeholder="Enter name"
              value={formData.adminName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </label>

          {/* Password match status message */}
          {formData.confirmPassword && (
            <p
              className={`password-status ${
                passwordMatch === null
                  ? ""
                  : passwordMatch
                  ? "match"
                  : "no-match"
              }`}
            >
              {passwordMatch === null
                ? ""
                : passwordMatch
                ? "Passwords match!"
                : "Passwords do not match!"}
            </p>
          )}

          {/* Google reCAPTCHA for security */}
          <ReCAPTCHA
            sitekey="6LenBvMqAAAAALN-DNzfq-TpKfRSru9kv4xuFIHg" // Replace with your actual reCAPTCHA site key
            onChange={(token) => setCaptchaToken(token)}
          />

          {/* Register button */}
          <button type="submit" className="submit-button">
            Register
          </button>
        </form>

        {/* Link to Admin Login Page */}
        <p>
          Already have an admin account?{" "}
          <Link to="/admin-login" className="login-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegistration;
