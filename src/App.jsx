// Importing React library
import React from "react";

// Importing Route and Routes from react-router-dom for navigation
import { Route, Routes } from "react-router-dom";

// Importing admin-related pages/components
import AdminPage from "./Admin/AdminRegistration/AdminRegistration";
import AdminLogin from "./Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard/AdminDashboard";
import PostJob from "./Admin/PostJob/PostJob";
import AdminAccSettings from "./Admin/AccountSettings/AccountSettings";
import ManageJobs from "./Admin/ManageJobs/ManageJobs";
import ViewApplications from "./Admin/ViewApplications/ViewApplications";

// Defining the main App component
function App() {
  return (
    <Routes>
      <Route path="/admin-account-settings" element={<AdminAccSettings />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/admin-register" element={<AdminPage />} />
      <Route path="/admin-home" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/manage-jobs" element={<ManageJobs />} />
      <Route path="/view-applications" element={<ViewApplications />} />
    </Routes>
  );
}

export default App;
