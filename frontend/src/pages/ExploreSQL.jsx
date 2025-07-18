// src/pages/ExploreSQL.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import SQLTool from "../components/SQLTool";

const ExploreSQL = () => {
  const availableTables = ["employee", "department"]; // Can be fetched dynamically later

  const handleTableClick = (table) => {
    alert(`You clicked table: ${table}\nFeature to preview data coming soon.`);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar tables={availableTables} onTableClick={handleTableClick} />
      <SQLTool />
    </div>
  );
};

export default ExploreSQL;
