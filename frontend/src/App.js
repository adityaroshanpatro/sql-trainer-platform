import React, { useState } from "react";
import axios from "axios";

function App() {
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
    <div style={{ padding: 20 }}>
      <h2>SQL Trainer</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={4}
        cols={60}
      />
      <br />
      <button onClick={runQuery}>Run</button>
      <table border="1" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            {result.length > 0 &&
              Object.keys(result[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {result.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
