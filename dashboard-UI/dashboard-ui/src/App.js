import React, { useState, useEffect } from "react";
import LogModal from "./LogModal";
import "./App.css";
import { loadShapes, fetchTurtle, validateTurtle } from "./shaclUtils";


function App() {
  const [jsonData, setJsonData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [shaclReports, setShaclReports] = useState({});
  const [shapesLoaded, setShapesLoaded] = useState(false);
  const [shapesError, setShapesError] = useState(null);
  const [shapesStore, setShapesStore] = useState(null);

  // List of SHACL shape files (relative to public folder for fetch)
  const shapeFiles = [
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-01-contains-ldes-EventStream.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-02-not-double-typed.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-03-tree-member-usage.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-04-tree-shape-usage.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-06-ldes-versionOfPath-usage.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-LPER-07-ldes-timestampPath-usage.ttl",
    process.env.PUBLIC_URL + "/ldes-src-shapes/ldes-common.ttl",
  ];

  useEffect(() => {
    const fetchJSONFiles = async () => {
      try {
        const context = require.context("./output_tests", false, /\.json$/);
        const files = context.keys();
        const data = files.map((file) => ({
          name: file,
          content: context(file),
        }));
        setJsonData(data);
      } catch (error) {
        console.error("Error loading JSON files:", error);
      }
    };
    fetchJSONFiles();
  }, []);

  useEffect(() => {
    // Load SHACL shapes once
    async function loadAllShapes() {
      try {
        const store = await loadShapes(shapeFiles);
        setShapesStore(store);
        setShapesLoaded(true);
      } catch (e) {
        setShapesError(e.message || 'Unknown error loading SHACL shapes');
        setShapesLoaded(false);
        setShapesStore(null);
        console.error("Error loading SHACL shapes", e);
      }
    }
    loadAllShapes();
  }, []);

  useEffect(() => {
    // For each URI, fetch Turtle and validate
    async function validateAll() {
      if (shapesError) {
        // If shapes failed to load, propagate error to all reports
        const reports = {};
        for (const file of jsonData) {
          const uri = file.content.uri;
          reports[uri] = { error: `SHACL shapes error: ${shapesError}` };
        }
        setShaclReports(reports);
        return;
      }
      if (!shapesLoaded || !shapesStore || jsonData.length === 0) return;
      const reports = {};
      for (const file of jsonData) {
        const uri = file.content.uri;
        try {
          const ttl = await fetchTurtle(uri);
          const report = await validateTurtle(ttl, shapesStore);
          reports[uri] = report;
        } catch (e) {
          reports[uri] = { error: e.message };
        }
      }
      setShaclReports(reports);
    }
    validateAll();
  }, [shapesLoaded, shapesStore, jsonData, shapesError]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>LOD Dashboard</h1>
        {jsonData.length > 0 ? (
          <div className="card-container">
            {jsonData.map((file, index) => {
              const ldesName = file.name.replace("./", "").replace(".json", "");
              const txtFileExists = require
                .context("./output_tests", false, /\.txt$/)
                .keys()
                .some((txtFile) =>
                  txtFile.includes(`ldes_consumer_logs_${ldesName}`)
                );

              // SHACL subsection for this URI
              const uri = file.content.uri;
              const shaclReport = shaclReports[uri];

              return (
                <div key={index} className="card">
                  {/* ...existing code... */}
                  <h2>
                    <span
                      style={{
                        color: file.content.test_suite.every(
                          (test) => test.result === "pass"
                        )
                          ? "green"
                          : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {file.content.test_suite.every(
                        (test) => test.result === "pass"
                      )
                        ? "All Tests Passed"
                        : "Some Tests Failed"}
                    </span>
                  </h2>
                  <p>
                    <strong>URI & Datetime Completed:</strong>{" "}
                    <a
                      href={file.content.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      {file.content.uri}
                    </a>{" "}
                    | {file.content.datetime_completed}
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "10px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          Name
                        </th>
                        <th
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          Result
                        </th>
                        <th
                          style={{ border: "1px solid #ddd", padding: "4px" }}
                        >
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {file.content.test_suite.map((test, idx) => (
                        <tr key={idx}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "4px" }}
                          >
                            {test.name}
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "4px",
                              color: test.result === "pass" ? "green" : "red",
                              fontWeight: "bold",
                            }}
                          >
                            {test.result}
                          </td>
                          <td
                            style={{ border: "1px solid #ddd", padding: "4px" }}
                          >
                            {test.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* SHACL Validation Results Subsection */}
                  <div style={{ marginTop: "20px", background: "#f9f9f9", padding: "10px", borderRadius: "6px" }}>
                    <h3>SHACL Validation Results</h3>
                    {shaclReport ? (
                      shaclReport.error ? (
                        <div style={{ color: "red" }}>Error: {shaclReport.error}</div>
                      ) : (
                        <div>
                          <strong>Conforms:</strong> {shaclReport.conforms ? "Yes" : "No"}
                          <ul>
                            {shaclReport.results && shaclReport.results.length > 0 ? (
                              shaclReport.results.map((result, i) => {
                                let msg = result.message;
                                if (Array.isArray(msg)) {
                                  msg = msg.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(', ');
                                } else if (typeof msg === 'object') {
                                  msg = JSON.stringify(msg);
                                }
                                return (
                                  <li key={i} style={{ color: result.severity === "Violation" ? "red" : "orange" }}>
                                    {msg}
                                  </li>
                                );
                              })
                            ) : (
                              <li>No SHACL violations found.</li>
                            )}
                          </ul>
                        </div>
                      )
                    ) : (
                      <div>Validating...</div>
                    )}
                  </div>
                  {/* ...existing code... */}
                  {txtFileExists && (
                    <>
                      <button
                        style={{
                          marginTop: "10px",
                          padding: "8px 12px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => setModalOpen(true)}
                      >
                        LDES Consumer Docker Logs
                      </button>
                      <LogModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        logFilePath={
                          txtFileExists
                            ? `./output_tests/ldes_consumer_logs_${ldesName}.txt`
                            : null // Gracefully handle missing .txt files
                        }
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading JSON data...</p>
        )}
      </header>
    </div>
  );
}

export default App;
