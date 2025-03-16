// Import required modules
import express from 'express';// Backend framework
import bcrypt from 'bcryptjs';// For password hashing
import mongoose from 'mongoose';// MongoDB ODM
import cors from 'cors';// Middleware for handling cross-origin requests
import bodyParser from 'body-parser';// Middleware for parsing request body
import axios from "axios";// To verify reCAPTCHA

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: "https://jobportalwebsite-admin.vercel.app",
  credentials: true,
}));// Enable CORS to allow frontend to communicate with backend
app.use(bodyParser.json()); // Parse incoming JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))// Log success
  .catch(err => console.error('MongoDB connection error:', err));// Log errors

// Define MongoDB Schema and Model for Admin Users
const userSchema = new mongoose.Schema({
  adminName: { type: String, required: true },// Admin's name
  email: { type: String, required: true, unique: true },// Email (unique identifier)
  password: { type: String, required: true },// Hashed password
  phone: { type: String },// Optional: Admin's phone number
  address: { type: String },// Optional: Admin's address
  profilePicture: { type: String },// Optional: Admin's profile picture URL
});

const User = mongoose.model('User', userSchema);// Create the model

// Admin Registration Route
//AdminRegistration.jsx
app.post('/register-admin', async (req, res) => {
  const { adminName, email, password, captchaToken } = req.body;

  try {
    // Verify reCAPTCHA with Google
    const secretKey = "6LenBvMqAAAAAJJCvGfNlbVQktHv4YgTuYon0PyJ"; // Replace with actual secret key
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    
    const captchaResponse = await axios.post(verifyUrl);
    if (!captchaResponse.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed!" });
    }

    // Check if an admin with the given email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new admin
    const newAdmin = new User({
      adminName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully.' });// Success response
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });// Handle server errors
  }
});

// Admin Login Route
//AdminLogin.jsx
app.post('/login-admin', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  try {
    // Verify reCAPTCHA with Google
    const secretKey = "6LenBvMqAAAAAJJCvGfNlbVQktHv4YgTuYon0PyJ"; // Replace with actual secret key
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    
    const captchaResponse = await axios.post(verifyUrl);
    if (!captchaResponse.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed!" });
    }
    // Find the admin by email
    const admin = await User.findOne({ email });
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare the entered password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Send a successful response with admin data
    const adminData = {
      adminName: admin.adminName,
      email: admin.email,
    };
    res.json({ admin: adminData });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get Admin Details Route to account settings page
//AccountSettings.jsx
app.get('/admin/:email', async (req, res) => {
  try {
    const admin = await User.findOne({ email: req.params.email }).select('-password'); // Exclude password
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    console.error('Error fetching admin details:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

//update account settings
//AccountSettings.jsx
app.put('/admin/update/:email', async (req, res) => {
  const { phone, address, profilePicture } = req.body;

  try {
    const updatedAdmin = await User.findOneAndUpdate(
      { email: req.params.email },
      { phone, address, profilePicture },
      { new: true } // Return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Account updated successfully', admin: updatedAdmin });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Password Update Route
//AccountSettings.jsx
app.put('/admin/update-password/:email', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the admin by email
    const admin = await User.findOne({ email: req.params.email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if the old password and new password are the same
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Hash the new password and update in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Delete Admin Account Route
//AccountSettings.jsx
app.delete('/admin/delete/:email', async (req, res) => {
  const email = req.params.email;
  console.log("Delete request received for email:", email); //Log to verify email
  
  try {
    const result = await User.findOneAndDelete({ email });

    if (!result) {
      console.error('Admin not found in database:', email); //Admin not found
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('Admin deleted successfully:', email); //Deletion success
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});


// Server setup
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
