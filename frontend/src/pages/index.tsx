import { useState, useEffect } from "react";
import axios from "axios";

interface Model {
  value: string;
  name: string;
  description: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-2.5-flash");
  const [loadingModels, setLoadingModels] = useState(true);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("http://localhost:8000/models");
        setModels(response.data.models);
        setLoadingModels(false);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load available models");
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

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
    formData.append("model", selectedModel);

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

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
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

  const downloadJson = () => {
    if (!output || !file) return;

    try {
      const jsonData = formatJson(output);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", ".json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading JSON:", error);
    }
  };

  const renderOutput = (content: string) => {
    if (isJson(content)) {
      return (
        <div>
          {/* Download Button */}
          <div className="text-center mb-3">
            <button
              onClick={downloadJson}
              className="btn btn-outline-success"
              disabled={!file}
            >
              <i className="bi bi-download me-2"></i>
              Download JSON
            </button>
          </div>

          {/* JSON Display */}
          <div
            className="bg-dark text-success p-4 rounded overflow-auto"
            style={{ maxHeight: "500px" }}
          >
            <pre className="mb-0 font-monospace small">
              {formatJson(content)}
            </pre>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="bg-light border rounded p-4 overflow-auto"
          style={{ maxHeight: "500px" }}
        >
          <pre className="mb-0 small">{content}</pre>
        </div>
      );
    }
  };

  return (
    <div
      className="min-vh-100 bg-gradient-primary py-5"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="display-4 mb-3">📄</div>
                  <h1 className="display-5 fw-bold text-primary mb-2">
                    PDF Parser
                  </h1>
                  <p className="text-muted lead">
                    Upload a PDF and get structured JSON data
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Model Selection Section */}
                  <div className="bg-light border rounded-3 p-4">
                    <h5 className="mb-3 text-primary">
                      <i className="bi bi-cpu me-2"></i>
                      Select AI Model
                    </h5>
                    {loadingModels ? (
                      <div className="text-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></div>
                        Loading available models...
                      </div>
                    ) : (
                      <div>
                        <select
                          value={selectedModel}
                          onChange={handleModelChange}
                          className="form-select form-select-lg mb-2"
                          disabled={loading}
                        >
                          {models.map((model) => (
                            <option key={model.value} value={model.value}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                        <div className="text-muted small">
                          <i className="bi bi-info-circle me-1"></i>
                          {
                            models.find((m) => m.value === selectedModel)
                              ?.description
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="border-3 border-dashed border-primary rounded-3 p-5 text-center bg-light">
                    <div className="mb-3">
                      <i className="bi bi-file-earmark-pdf display-4 text-primary"></i>
                    </div>
                    <h5 className="mb-3">Choose a PDF file to parse</h5>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="d-none"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-primary btn-lg px-4 py-2"
                    >
                      <i className="bi bi-upload me-2"></i>
                      Select PDF File
                    </label>
                    {file && (
                      <div className="mt-3">
                        <div className="alert alert-success d-inline-flex align-items-center">
                          <i className="bi bi-check-circle me-2"></i>
                          <span className="small">{file.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="text-center">
                    <button
                      onClick={handleUpload}
                      disabled={loading || !file || loadingModels}
                      className="btn btn-success btn-lg px-5 py-3"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing PDF...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-play-circle me-2"></i>
                          Parse PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="alert alert-danger border-0 shadow-sm">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                        <div>
                          <strong>Error:</strong> {error}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Output Display */}
                  {output && (
                    <div className="bg-light border-0 rounded-3 p-4 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 text-primary">
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Parsed Content
                        </h5>
                        <span className="badge bg-success">JSON Ready</span>
                      </div>
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
