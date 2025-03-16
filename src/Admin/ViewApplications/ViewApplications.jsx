import React, { useState, useEffect } from "react";
import "./ViewApplications.css";// External CSS file for styling

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);// Stores job applications
  const [searchTerm, setSearchTerm] = useState("");// State for search bar
  const [loading, setLoading] = useState(true);// Loading state
  const [error, setError] = useState(null);// Error state

  // Fetch job applications from the backend when the component mounts
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const adminName = localStorage.getItem("adminName"); // Retrieve admin name from localStorage
        if (!adminName) throw new Error("Admin name not found in local storage.");

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/job-applications?company=${adminName}`); // API call to fetch job applications
        if (!response.ok) throw new Error("Failed to fetch applications.");

        const data = await response.json();
        setApplications(data);// Update state with fetched applications
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Function to update the status of an application
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/job-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status.");

      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  // Function to download resume
  const handleResumeDownload = async (email, resumeName) => {
    if (!email) {
      alert("Email is missing for this applicant.");
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resume/${email}`);// Fetch resume from backend
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch resume");
      }
  
      const blob = await response.blob();// Convert response to blob
      const url = window.URL.createObjectURL(blob);
  
      // Create and trigger a download link
      const a = document.createElement("a");
      a.href = url;
      a.download = resumeName || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading resume:", err);
      alert(`Error: ${err.message}`);
    }
  };
  

  // Categorizing applications based on status
  const pendingApplications = applications.filter((app) => app.status === "Pending");
  const reviewedApplications = applications.filter((app) => app.status === "Reviewed");
  const acceptedApplications = applications.filter((app) => app.status === "Accepted");
  const rejectedApplications = applications.filter((app) => app.status === "Rejected");

  // Function to render application tables
  const renderTable = (title, data) => (
    <div>
      <h2>{title}</h2>
      <table className="applications-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>Job Title</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Resume</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((app, index) => (
              <tr key={app._id || index}>
                <td>{index + 1}</td>
                <td>{app.fullName || app.username}</td>
                <td>{app.jobTitle}</td>
                <td>{app.email}</td>
                <td>{app.skills?.join(", ") || "N/A"}</td>
                <td>
                  {app.resume ? (
                    <button
                      className="resume-button"
                      onClick={() => handleResumeDownload(app.email, app.resume.name)}
                    >
                      View Resume
                    </button>
                  ) : (
                    "No Resume"
                  )}
                </td>
                <td>
                  {/* Dropdown to update application status */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className={`status ${app.status.toLowerCase()}`}
                    style={{
                      color:
                        app.status === "Reviewed"
                          ? "#2196f3"
                          : app.status === "Accepted"
                          ? "#4caf50"
                          : app.status === "Rejected"
                          ? "#f44336"
                          : "#ff9800",
                    }}
                  >
                    <option value="Pending" style={{ color: "#ff9800" }}>Pending</option>
                    <option value="Reviewed" style={{ color: "#2196f3" }}>Reviewed</option>
                    <option value="Accepted" style={{ color: "#4caf50" }}>Accepted</option>
                    <option value="Rejected" style={{ color: "#f44336" }}>Rejected</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results">No applications found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="applications-container">
      {/* Back button to navigate to the admin home page */}
      <button className="back-btn" onClick={() => window.location.href = "/admin-home"}>
    ←
  </button>
      <h1>Job Applications</h1>

      {/* Search bar for filtering applications by job title */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Display loading or error messages */}
      {loading && <p className="loading">Loading applications...</p>}
      {error && <p className="error">Error: {error}</p>}

      {/* Display categorized applications */}
      {!loading && !error && (
        <>
          {renderTable("Pending Applications", pendingApplications)}
          {renderTable("Reviewed Applications", reviewedApplications)}
          {renderTable("Accepted Applications", acceptedApplications)}
          {renderTable("Rejected Applications", rejectedApplications)}
        </>
      )}
    </div>
  );
};

export default ViewApplications;
