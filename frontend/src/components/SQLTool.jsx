// src/components/SQLTool.jsx
import React, { useState } from "react";
import axios from "axios";
import "./SQLTool.css"; // Custom styles

const SQLTool = () => {
  const [query, setQuery] = useState("SELECT * FROM employee");
  const [result, setResult] = useState([]);

  const runQuery = async () => {
    const trimmed = query.trim();
    const safeQuery = trimmed.endsWith(";") ? trimmed : trimmed + ";";

    try {
      const res = await axios.post("http://localhost:4000/query", { sql: safeQuery });
      setResult(res.data.rows);
    } catch (err) {
      alert(err.response?.data?.error || "Error running query");
    }
  };

  return (
    <div style={{ padding: "1rem", flex: 1 }}>
      <h2>SQL Editor</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={4}
        cols={80}
        style={{ width: "100%", fontFamily: "monospace", fontSize: "1rem" }}
      />
      <br />
      <button onClick={runQuery} style={{ marginTop: "0.5rem" }}>
        Run
      </button>

      {result.length > 0 && (
        <div className="result-table-container">
          <table className="result-table">
            <thead>
              <tr>
                {Object.keys(result[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SQLTool;
