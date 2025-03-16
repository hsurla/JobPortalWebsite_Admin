import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";// Importing reusable card components
import { BarChart2, FileText, UserPlus, Briefcase } from "lucide-react";// Importing icons
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";// Importing Axios for API requests
import "./AdminDashboard.css";// Importing external CSS file for styling

const AdminDashboard = () => {
  // State variables to store admin details and dashboard data
  const [adminName, setAdminName] = useState("");
  const [jobCount, setJobCount] = useState(0); // Count of active job posts
  const [totalApplications, setTotalApplications] = useState(0);// Count of total applications
  const [newApplications, setNewApplications] = useState(0);// Count of new applications
  const navigate = useNavigate();// Hook for navigation

  useEffect(() => {
    // Retrieve admin name from local storage
    const storedAdminName = localStorage.getItem("adminName");
    if (storedAdminName) {
      setAdminName(storedAdminName);
    } else {
      navigate("/admin-login");// Redirect to login if admin is not authenticated
    }

    fetchDashboardData();// Fetch dashboard data
  }, [navigate]);

  // Function to fetch dashboard data from the server
  const fetchDashboardData = async () => {
    try {
      const storedAdminEmail = localStorage.getItem("adminEmail"); // Retrieve admin email from local storage
      const storedAdminName = localStorage.getItem("adminName");// Retrieve admin name from local storage
  
      if (!storedAdminEmail) {
        console.error("Admin email not found.");// Log error if email is missing
        return;
      }
  
      // Fetching active job posts count specific to the admin
      const jobsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/jobs?email=${storedAdminEmail}`);
      const jobs = jobsResponse.data;
      setJobCount(jobs.length); // Updating job count
  
      // Fetching total and new applications count
      const applicationsResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/applications-count?company=${storedAdminName}`);
      setTotalApplications(applicationsResponse.data.totalApplications);// Updating total applications count
      setNewApplications(applicationsResponse.data.newApplications);// Updating new applications count
  
    } catch (error) {
      console.error("Error fetching dashboard data:", error);// Handling errors
    }
  };
  
  // Function to handle admin logout
  const handleLogout = () => {
    localStorage.removeItem("adminName");// Remove admin name from local storage
    localStorage.removeItem("adminToken");// Remove authentication token
    navigate("/admin-login");// Redirect to login page
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="navbar-title">Admin Dashboard</h1>
        <ul className="navbar-menu">
          <li className="menu-item"><Link to="/post-job">Post a Job</Link></li>
          <li className="menu-item"><Link to="/manage-jobs">Manage Jobs</Link></li>
          <li className="menu-item"><Link to="/view-applications">View Applications</Link></li>
          <li className="menu-item"><Link to="/admin-account-settings">Account Settings</Link></li>
          <li className="menu-item logout">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      {/* Welcome Message */}
      <div className="welcome-message">
        <h2 className="welcome-title">Welcome, {adminName || "Admin"}!</h2>
        <p className="welcome-text">Here’s an overview of your portal activity.</p>
      </div>

      {/* Dashboard Overview - Displaying dynamic statistics */}
      <div className="dashboard-overview">
        <Card>
          <CardContent className="overview-card">
            <div>
              <h3 className="card-title">Active Job Posts</h3>
              <p className="card-value">{jobCount}</p>
            </div>
            <Briefcase className="card-icon" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="overview-card">
            <div>
              <h3 className="card-title">Total Applications</h3>
              <p className="card-value">{totalApplications}</p>
            </div>
            <FileText className="card-icon" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="overview-card">
            <div>
              <h3 className="card-title">New Applications</h3>
              <p className="card-value">{newApplications}</p>
            </div>
            <UserPlus className="card-icon" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
