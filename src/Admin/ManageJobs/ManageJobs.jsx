import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageJobs.css";// External CSS file for styling

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);// State to store job listings

  // Fetch job listings from the backend when the component mounts
  useEffect(() => {
    const fetchJobs = async () => {
        try {
            const email = localStorage.getItem("adminEmail");// Retrieve admin email from localStorage
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs?email=${email}`);// API call to fetch jobs
            const data = await response.json();
            setJobs(data);// Update state with fetched job listings
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };
    fetchJobs();
}, []);

  // Function to delete a job by its ID
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;// Confirm deletion

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`);// API call to delete job
      setJobs(jobs.filter((job) => job.id !== id)); // Update state to reflect the deleted job
      alert("Job deleted successfully!");// Show success message
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete the job.");// Show error message
    }
  };

  return (
    <div className="manage-jobs-container">
      {/* Back button to navigate to the admin home page */}
      <button className="back-btn" onClick={() => window.location.href = "/admin-home"}>
        ←
      </button>
      <h2>Manage Jobs</h2>

      {/* Table to display job listings */}
      <table className="jobs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>
                {/* Delete button for each job */}
                <button className="delete-button" onClick={() => handleDelete(job.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageJobs;
