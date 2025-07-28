import React, { useEffect, useState } from "react";
import axios from "axios";
import SQLTool from "../components/SQLTool";
import "../components/ExploreSQL.css";

function ExploreSQL() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("http://localhost:4000/tables");

        // Convert array of objects into [{ name, data }]
        const formattedTables = res.data.tables.map((tableObj) => {
          const name = Object.keys(tableObj)[0];
          const data = tableObj[name];
          return { name, data };
        });

        setTables(formattedTables);
      } catch (err) {
        console.error("Error fetching tables:", err);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable(table.name);
    setTableData(table.data || []);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          background: "#f1f1f1",
          padding: "10px",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <h3>Tables</h3>
        {tables.map((table) => (
          <div
            key={table.name}
            style={{
              padding: "8px",
              cursor: "pointer",
              backgroundColor: selectedTable === table.name ? "#ddd" : "transparent",
              borderRadius: "4px",
              marginBottom: "4px",
            }}
            onClick={() => handleTableClick(table)}
          >
            {table.name}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <SQLTool />

        {selectedTable && (
          <>
            <h3 style={{ marginTop: "40px" }}>Preview: {selectedTable}</h3>
            {Array.isArray(tableData) && tableData.length > 0 ? (
              <div style={{ overflowX: "auto", marginTop: "10px" }}>
                <table className="table-preview">
                  <thead>
                    <tr>
                      {Object.keys(tableData[0] || {}).map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, idx) => (
                          <td key={idx}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data found for this table.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreSQL;
