// src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({ tables, onTableClick }) => {
  return (
    <div style={{ width: "220px", backgroundColor: "#f4f4f4", padding: "1rem", height: "100vh" }}>
      <h3>Navigation</h3>
      <div style={{ marginBottom: "1rem" }}>
        <strong>→</strong> SQL Tool
      </div>
      <h4>Tables</h4>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {tables.map((table) => (
          <li
            key={table}
            style={{ cursor: "pointer", padding: "4px 0", color: "#007acc" }}
            onClick={() => onTableClick(table)}
          >
            {table}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
