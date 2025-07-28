import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOutput(res.data.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error ||
          "Error occurred while processing. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setOutput(null);
  };

  const isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const renderOutput = (content: string) => {
    if (isJson(content)) {
      return (
        <div>
          {/* View Mode Toggle */}
          <div className="text-center mb-3">
            <div className="btn-group" role="group">
              <button
                onClick={() => setViewMode("formatted")}
                className={`btn ${
                  viewMode === "formatted"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
              >
                Formatted JSON
              </button>
              <button
                onClick={() => setViewMode("raw")}
                className={`btn ${
                  viewMode === "raw" ? "btn-primary" : "btn-outline-primary"
                }`}
              >
                Raw Text
              </button>
            </div>
          </div>

          {/* JSON Display */}
          {viewMode === "formatted" ? (
            <div
              className="bg-dark text-success p-3 rounded overflow-auto"
              style={{ maxHeight: "400px" }}
            >
              <pre className="mb-0 font-monospace small">
                {formatJson(content)}
              </pre>
            </div>
          ) : (
            <div
              className="bg-light border rounded p-3 overflow-auto"
              style={{ maxHeight: "400px" }}
            >
              <pre className="mb-0 small">{content}</pre>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          className="bg-light border rounded p-3 overflow-auto"
          style={{ maxHeight: "400px" }}
        >
          <pre className="mb-0 small">{content}</pre>
        </div>
      );
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body p-5">
                <h1 className="text-center mb-5">📄 PDF Parser</h1>

                <div className="space-y-4">
                  {/* File Upload Section */}
                  <div className="border-2 border-dashed border-secondary rounded p-4 text-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="d-none"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-primary cursor-pointer"
                    >
                      Choose PDF File
                    </label>
                    {file && (
                      <p className="mt-2 text-muted small">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="text-center">
                    <button
                      onClick={handleUpload}
                      disabled={loading || !file}
                      className="btn btn-success btn-lg"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        "Upload and Parse"
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Output Display */}
                  {output && (
                    <div className="bg-light border rounded p-3">
                      <h5 className="mb-3">Parsed Content:</h5>
                      {renderOutput(output)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
