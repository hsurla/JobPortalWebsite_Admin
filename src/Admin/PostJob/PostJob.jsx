import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostJob.css";

const PostJob = () => {
  // State to store job details
  const [jobDetails, setJobDetails] = useState({
    title: "",
    company: "",// Automatically fetched from localStorage
    location: "",
    salary: "",
    description: "",
    qualifications: "",
    aboutCompany: "",
    adminemail:"",// Automatically fetched from localStorage
  });

  // Ref to track the last used job ID (for generating unique IDs)
  const lastIdRef = useRef(0);

  // Hook for navigation
  const navigate = useNavigate(); 

  // Fetch the admin's company name and email from localStorage when the component mounts
  useEffect(() => {
    const adminName = localStorage.getItem("adminName");// Get admin's company name
    const email = localStorage.getItem("adminEmail");// Get admin's email
    if (adminName) {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        company: adminName,// Set company field as adminName
        adminemail: email,// Store admin email
      }));
    }
  }, []);

  // Handles input changes in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  // Function to generate the next numeric job ID
  const generateNextId = () => {
    lastIdRef.current += 1;// Increment the last used ID
    return lastIdRef.current; // Return the new ID
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();// Prevent default form submission behavior
    console.log("Posting job with details:", jobDetails);

    // Generate a unique job ID
    const jobWithId = {
      ...jobDetails,
      id: generateNextId(), // Assign new ID to the job
    };

    try {
      // Send a POST request to the backend to save the job
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/save-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobWithId), // Send job with ID
      });

      // Check if the job was posted successfully
      if (response.ok) {
        alert("Job Posted Successfully!");// Show success alert
        // Reset the form while keeping the company name
        setJobDetails({
          title: "",
          company: jobDetails.company, // Keep the company name as the adminName
          location: "",
          salary: "",
          description: "",
          qualifications: "",
          aboutCompany: "",
        });
        navigate("/admin-home");// Redirect to admin dashboard
      } else {
        alert("Error posting job.");// Show error message
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server not reachable.");// Alert if backend is down
    }
  };

  return (
    
    <div className="post-job-container">
      <button className="back-btn" onClick={() => window.location.href = "/admin-home"}>
    ←
  </button>
      <h1>Post a Job</h1>
      <form className="post-job-form" onSubmit={handleSubmit}>
        {/* Job Title Field */}
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={jobDetails.title}
            onChange={handleInputChange}
            placeholder="Enter job title"
            required
          />
        </div>

        {/* Company Name Field (Pre-filled & Read-only) */}
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={jobDetails.company}
            onChange={handleInputChange}
            placeholder="Enter company name"
            required
            readOnly // Make the field read-only
          />
        </div>

        {/* Location Field */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={jobDetails.location}
            onChange={handleInputChange}
            placeholder="Enter job location"
            required
          />
        </div>

        {/* Salary Field */}
        <div className="form-group">
          <label htmlFor="salary">Salary</label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={jobDetails.salary}
            onChange={handleInputChange}
            placeholder="Enter salary"
            required
          />
        </div>

        {/* Job Description Field */}
        <div className="form-group">
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            value={jobDetails.description}
            onChange={handleInputChange}
            placeholder="Enter job description"
            required
          />
        </div>

        {/* Qualifications Field */}
        <div className="form-group">
          <label htmlFor="qualifications">Qualifications</label>
          <textarea
            id="qualifications"
            name="qualifications"
            value={jobDetails.qualifications}
            onChange={handleInputChange}
            placeholder="Enter qualifications"
            required
          />
        </div>

        {/* About Company Field */}
        <div className="form-group">
          <label htmlFor="aboutCompany">About the Company</label>
          <textarea
            id="aboutCompany"
            name="aboutCompany"
            value={jobDetails.aboutCompany}
            onChange={handleInputChange}
            placeholder="Enter details about the company"
            required
          />
        </div>

        {/* Hidden Field to Store Admin Email */}
        <input
        type="hidden"
        name="email"
        value={jobDetails.email}
        readOnly
        />

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;