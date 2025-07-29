import React from "react";
import { isJson, formatJson, downloadJson } from "../utils/helpers";

interface OutputViewerProps {
  content: string;
  filename: string;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  content,
  filename,
}) => {
  const handleDownload = () => {
    downloadJson(content, filename);
  };

  if (isJson(content)) {
    return (
      <div className="bg-light border-0 rounded-3 p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 text-primary">
            <i className="bi bi-file-earmark-text me-2" aria-hidden="true"></i>
            Parsed Content
          </h5>
          <span className="badge bg-success">JSON Ready</span>
        </div>

        {/* Download Button */}
        <div className="text-center mb-3">
          <button
            onClick={handleDownload}
            className="btn btn-outline-success"
            aria-label="Download parsed JSON file"
          >
            <i className="bi bi-download me-2" aria-hidden="true"></i>
            Download JSON
          </button>
        </div>

        {/* JSON Display */}
        <div
          className="bg-dark text-success p-4 rounded overflow-auto"
          style={{ maxHeight: "500px" }}
          role="textbox"
          aria-label="Parsed JSON content"
        >
          <pre className="mb-0 font-monospace small">{formatJson(content)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light border-0 rounded-3 p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 text-primary">
          <i className="bi bi-file-earmark-text me-2" aria-hidden="true"></i>
          Parsed Content
        </h5>
        <span className="badge bg-warning">Raw Output</span>
      </div>

      <div
        className="bg-light border rounded p-4 overflow-auto"
        style={{ maxHeight: "500px" }}
        role="textbox"
        aria-label="Parsed content"
      >
        <pre className="mb-0 small">{content}</pre>
      </div>
    </div>
  );
};
