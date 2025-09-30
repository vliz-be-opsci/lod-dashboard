import React, { useState } from "react";
import PrettyJson from "./PrettyJson";

const ValidationResultCard = ({ result }) => {
  const [showRaw, setShowRaw] = useState(false);
  if (result && typeof result === "object" && result.value) {
    return (
      <div style={{
        background: "#e3f2fd",
        border: "1px solid #90caf9",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "10px",
        color: "#1565c0",
        position: "relative"
      }}>
        <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
          {result.value}
        </div>
        {result.datatype && (
          <div style={{ fontSize: "0.9em", color: "#1976d2", marginTop: "4px" }}>
            Datatype: <span style={{ fontWeight: "bold" }}>{result.datatype.termType}</span> (<span>{result.datatype.value}</span>)
          </div>
        )}
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: showRaw ? "#222" : "#90caf9",
            color: showRaw ? "#fff" : "#1565c0",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "0.85em"
          }}
          onClick={() => setShowRaw(v => !v)}
        >
          {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
        </button>
        {showRaw && (
          <div style={{ marginTop: "10px" }}>
            <PrettyJson data={result} />
          </div>
        )}
      </div>
    );
  }
  // fallback for non-object or unexpected structure
  return <PrettyJson data={result} />;
};

export default ValidationResultCard;
