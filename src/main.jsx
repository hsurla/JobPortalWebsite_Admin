// Importing React and ReactDOM for rendering components
import React from "react";
import ReactDOM from "react-dom/client";

// Importing BrowserRouter for enabling routing in the app
import { BrowserRouter } from "react-router-dom";

// Importing the main App component
import App from "./App";

// Importing global styles
import "./index.css";


// Rendering the App component inside BrowserRouter to enable navigation
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
