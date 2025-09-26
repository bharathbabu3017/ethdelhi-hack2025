import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Future routes:
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/api" element={<ApiDocs />} />
          */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
