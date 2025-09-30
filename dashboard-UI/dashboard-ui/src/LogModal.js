// LogModal.js
import React, { useState, useEffect } from "react";
import "./LogModal.css";

const LogModal = ({ isOpen, onClose, logFilePath }) => {
  const [logContent, setLogContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLines, setFilteredLines] = useState([]);

  useEffect(() => {
    if (isOpen && logFilePath) {
      fetch(logFilePath)
        .then((response) => response.text())
        .then((data) => {
          setLogContent(data);
          setFilteredLines(data.split("\n"));
        })
        .catch((error) => console.error("Error loading log file:", error));
    }
  }, [isOpen, logFilePath]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term) {
      setFilteredLines(
        logContent.split("\n").filter((line) => line.includes(term))
      );
    } else {
      setFilteredLines(logContent.split("\n"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Log Viewer {logFilePath}</h2>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />
        <div className="log-container">
          {filteredLines.map((line, index) => (
            <p key={index} className="log-line">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
