import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to SQL Trainer</h1>
      <p>
        This platform helps you learn and practice SQL using interactive tools and a game-based 123
        learning path.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/explore")} style={{ marginRight: "1rem" }}>
          Explore SQL
        </button>
        <button onClick={() => navigate("/learn")}>Start Learning</button>
      </div>
    </div>
  );
};

export default LandingPage;
