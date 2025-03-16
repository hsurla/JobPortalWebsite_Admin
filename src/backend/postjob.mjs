// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "https://jobportalwebsite-admin.vercel.app",
  methods:["GET","POST","PUT","DELETE"],
  credentials: true,
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


/**
 * Schema for job postings
 * Each job has a unique auto-incremented ID per adminemail
 */
const jobSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: false },
  title: String,
  company: String,
  location: String,
  salary: Number,
  description: String,
  qualifications: String,
  aboutCompany: String,
  adminemail: String,// Used to identify which admin posted the job
});

// Auto-increment job ID per admin
jobSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); 

  try {
    const lastJob = await Job.findOne({ adminemail: this.adminemail }).sort({ id: -1 });

    this.id = lastJob ? lastJob.id + 1 : 1; 
    next();
  } catch (error) {
    next(error);
  }
});

const Job = mongoose.model('Job', jobSchema);

// ---------------------- JOB POSTING ROUTES ----------------------

// Route to save a job posting with auto-incrementing ID
//PostJob.jsx
app.post("/save-job", async (req, res) => {
  try {
    const { adminemail } = req.body;

    // Find the last job posted by this admin
    const lastJob = await Job.findOne({ adminemail }).sort({ id: -1 });

    let newId = 1; // Default ID if no previous job exists

    if (lastJob) {
      newId = lastJob.id + 1; // Increment ID based on the last job
    }

    console.log(`Last Job for ${adminemail}:`, lastJob ? lastJob.id : "None");
    console.log(`New ID assigned: ${newId}`);

    // Create and save the new job
    const newJob = new Job({
      id: newId,
      ...req.body, // Spread other job details
    });

    await newJob.save();
    res.status(201).json({ message: "Job Posted Successfully!", id: newId });
  } catch (err) {
    console.error("Error posting job:", err);
    res.status(500).json({ message: "Error posting job." });
  }
});

// Route to fetch all jobs posted by a specific admin
//ManageJobs.jsx, AdminDashboard.jsx
app.get('/jobs', async (req, res) => {
  const { email } = req.query;
  try {
    const jobs = await Job.find({ adminemail: email }); // Filter jobs by email
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).send('Error fetching jobs.');
  }
});

// Route to delete a job posting by ID
//ManageJobs.jsx
app.delete('/jobs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedJob = await Job.findOneAndDelete({ id: id });

    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

//ViewApplications Backend
const jobApplicationSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true }, // Fetch from User model
  fullName: { type: String, default: "" }, // Fetch from User model
  contactNumber: { type: String, default: "" }, // Fetch from User model
  education: {
    institution: { type: String, default: "" },
    degree: { type: String, default: "" },
    graduationYear: { type: String, default: "" },
  },
  skills: { type: [String], default: [] }, 
  jobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Reviewed", "Accepted", "Rejected"], default: "Pending" },
  resume: {
    data: Buffer, // Store file as binary
    contentType: String, // MIME type
    name: String, // Original filename
  },
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

// Route to fetch all job applications for a specific company
//ViewApplications.jsx
app.get('/job-applications', async (req, res) => {
  const { company } = req.query;

  try {
    const applications = await JobApplication.find({ company });

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this company.' });
    }

    res.status(200).json(applications);
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Route to fetch a specific job application by ID
//ViewApplications.jsx
app.put('/job-applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Get the new status

  if (!["Pending", "Reviewed", "Accepted", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status }, // ✅ Only update status
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ message: "Application status updated.", application: updatedApplication });
  } catch (err) {
    console.error("Error updating job application:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Route to update a job application (e.g., change status)
//ViewApplications.jsx
app.put('/job-applications/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedApplication = await JobApplication.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json({ message: 'Application updated successfully.', application: updatedApplication });
  } catch (err) {
    console.error('Error updating job application:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

//view resume -{ViewApplications.jsx}
app.get("/resume/:email", async (req, res) => {
  try {
    console.log("Fetching resume for email:", req.params.email);

    const user = await JobApplication.findOne({ email: req.params.email });

    if (!user) {
      console.log("User not found for email:", req.params.email);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resume || !user.resume.data) {
      console.log("Resume not found for user:", user.email);
      return res.status(404).json({ message: "Resume not found" });
    }

    // Send the resume file
    res.set("Content-Type", user.resume.contentType);
    res.set("Content-Disposition", `attachment; filename="${user.resume.name}"`);
    res.send(user.resume.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get the total and new applications count for a specific admin
//AdminDashboard.jsx
app.get('/applications-count', async (req, res) => {
  const { company } = req.query;

  try {
    if (!company) {
      return res.status(400).json({ message: "Company name is required." });
    }

    // Fetch total applications
    const totalApplications = await JobApplication.countDocuments({ company });

    // Fetch new applications in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newApplications = await JobApplication.countDocuments({
      company,
      appliedAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({ totalApplications, newApplications });
  } catch (err) {
    console.error("Error fetching application counts:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
