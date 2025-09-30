import React from "react";

const PrettyJson = ({ data }) => {
  if (!data) return null;
  let jsonString;
  try {
    jsonString = JSON.stringify(data, null, 2);
  } catch (e) {
    jsonString = "[Invalid JSON]";
  }
  return (
    <pre style={{
      background: "#222",
      color: "#fff",
      padding: "12px",
      borderRadius: "6px",
      fontSize: "0.95em",
      overflowX: "auto",
      maxHeight: "400px"
    }}>{jsonString}</pre>
  );
};

export default PrettyJson;
