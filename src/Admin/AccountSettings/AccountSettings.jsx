import React, { useState, useEffect } from "react";
import "./AccountSettings.css";
import axios from 'axios';

const AccountSettings = () => {
  // State to manage which section is active
  const [activeSection, setActiveSection] = useState("personalInfo");

  // Retrieve admin details from local storage
  const [adminName] = useState(localStorage.getItem("adminName") || "");
  const [email] = useState(localStorage.getItem("adminEmail") || "");

  // State variables for personal information
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // State variables for password management
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Fetch admin details (phone and address) from the database
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/admin/${email}`);
        setPhone(response.data.phone || "");
        setAddress(response.data.address || "");
      } catch (error) {
        console.error("Error fetching admin details:", error);
      }
    };

    if (email) {
      fetchAdminDetails();
    }
  }, [email]);

  // Function to update personal information
  const handleSaveChanges = async (e) => {
    e.preventDefault(); // Prevents page refresh
  
    try {
      const email = localStorage.getItem("adminEmail");
  
      // Send updated phone and address data to the backend
      await axios.put(`http://localhost:5001/admin/update/${email}`, {
        phone,
        address,
      });
  
      alert("Profile updated successfully! ✅");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile ❌");
    }
  };

  // Function to handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
  
    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
  
    // Prevent using the same password as the old one
    if (currentPassword === newPassword) {
      alert("New password cannot be the same as the current password.");
      return;
    }
  
    try {
      const email = localStorage.getItem("adminEmail");
  
      // Send password update request to the backend
      await axios.put(`http://localhost:5001/admin/update-password/${email}`, {
        currentPassword,
        newPassword,
      });
  
      alert("Password updated successfully! ✅");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.response?.data?.message || "Failed to update password ❌");
    }
  };

  // Function to delete the admin account
  const handleDeleteAccount = async () => {
    const email = localStorage.getItem("adminEmail");
    console.log("Email for deletion:", email);
  
    if (!email) {
      alert("No account found to delete.");
      return;
    }
  
    // Confirm deletion before proceeding
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }
  
    try {
      // Delete the account from the database
      const response = await axios.delete(`http://localhost:5001/admin/delete/${encodeURIComponent(email)}`);
      console.log("Delete response:", response.data);
      
      // Clear local storage and redirect to login page
      localStorage.clear();
      alert("Account deleted successfully.");
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Error deleting account:", error.response?.data || error.message);
      alert("Failed to delete account. Please try again.");
    }
  };
    
  // Function to render different sections of the account settings page
  const renderSection = () => {
    switch (activeSection) {
      case "personalInfo":
        return (
          <div className="form-section">
            <h2>Personal Information Management</h2>
            <form>
            <div className="form-group">
                <label>Company Name:</label>
                <input 
                type="text" 
                value={adminName}
                readOnly
                />
              </div>
              <div className="form-group">
                <label>Email Address:</label>
                <input 
                type="email"
                value={email}
                readOnly  
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number" />
              </div>
              <div className="form-group">
                <label>Profile Picture:</label>
                <input type="file"
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address" />
              </div>
              <button type="submit" className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
            </form>
          </div>
        );

      case "passwordManagement":
        return (
          <div className="form-section">
            <h2>Password Management</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password:</label>
                <input 
                type="password" 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input 
                type="password" 
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)} 
                required
                />
              </div>
              <button type="submit" className="save-btn">Update Password</button>
            </form>
          </div>
        );

      case "deleteAccount":
        return (
          <div className="form-section">
            <h2>Delete Account</h2>
            <p>
              Warning: Deleting your account will permanently remove all
              associated data, including posted jobs and account information.
            </p>
            <button 
            className="save-btn" 
            style={{ backgroundColor: "red" }}
            onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <button className="back-btn" onClick={() => window.location.href = "/admin-home"}>
    ←
  </button>
    <header className="page-header">
        <h1>Account Settings</h1>
      </header>
    <div className="account-settings-container">
      <div className="menu">
        <button onClick={() => setActiveSection("personalInfo")}>
          Personal Info
        </button>
        <button onClick={() => setActiveSection("passwordManagement")}>
          Password Management
        </button>
        <button onClick={() => setActiveSection("deleteAccount")}>
          Delete Account
        </button>
      </div>
      <div className="content">{renderSection()}</div>
    </div>
    </>
  );
};

export default AccountSettings;
