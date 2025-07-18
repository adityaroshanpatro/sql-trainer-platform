import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExploreSQL from "./pages/ExploreSQL";
import LearnSQL from "./pages/LearnSQL";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExploreSQL />} />
        <Route path="/learn" element={<LearnSQL />} />
      </Routes>
    </Router>
  );
}

export default App;
