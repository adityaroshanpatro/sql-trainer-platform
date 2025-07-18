// src/components/SQLTool.jsx
import React, { useState } from "react";
import axios from "axios";

const SQLTool = () => {
  const [query, setQuery] = useState("SELECT * FROM employee");
  const [result, setResult] = useState([]);

  const runQuery = async () => {
    try {
      const res = await axios.post("http://localhost:4000/query", { sql: query });
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
      />
      <br />
      <button onClick={runQuery} style={{ marginTop: "0.5rem" }}>
        Run
      </button>

      {result.length > 0 && (
        <table border="1" style={{ marginTop: "1rem" }}>
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
      )}
    </div>
  );
};

export default SQLTool;
