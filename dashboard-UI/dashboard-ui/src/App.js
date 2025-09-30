import React, { useState, useEffect } from "react";
import LogModal from "./LogModal";
import "./App.css";

function App() {
  const [jsonData, setJsonData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>LOD Dashboard</h1>
        {jsonData.length > 0 ? (
          <div className="card-container">
            {jsonData.map((file, index) => {
              const ldesName = file.name.replace("./", "").replace(".json", "");
              console.log(
                "Checking for log file:",
                `ldes_consumer_logs_${ldesName}.txt`
              );
              const txtFileExists = require
                .context("./output_tests", false, /\.txt$/)
                .keys()
                .some((txtFile) =>
                  txtFile.includes(`ldes_consumer_logs_${ldesName}`)
                );

              return (
                <div key={index} className="card">
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
