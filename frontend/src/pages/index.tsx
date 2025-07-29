import React, { useState, useCallback } from "react";
import { ModelSelector } from "../components/ModelSelector";
import { FileUploader } from "../components/FileUploader";
import { OutputViewer } from "../components/OutputViewer";
import { useModelFetcher } from "../hooks/useModelFetcher";
import { uploadPDF, ApiError } from "../utils/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-2.5-flash");

  const {
    models,
    loading: modelsLoading,
    error: modelsError,
  } = useModelFetcher();

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
    setOutput(null);
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model);
    setError(null);
    setOutput(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await uploadPDF(file, selectedModel);
      setOutput(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Error occurred while processing. Please make sure the backend server is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [file, selectedModel]);

  // Show models error if it exists
  if (modelsError) {
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
                <div className="card-body p-5 text-center">
                  <div className="alert alert-danger border-0 shadow-sm">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                      <div>
                        <strong>Error:</strong> {modelsError}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <div
                    className="display-4 mb-3"
                    role="img"
                    aria-label="PDF document"
                  >
                    📄
                  </div>
                  <h1 className="display-5 fw-bold text-primary mb-2">
                    PDF Parser
                  </h1>
                  <p className="text-muted lead">
                    Upload a PDF and get structured JSON data
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Model Selection Section */}
                  <ModelSelector
                    models={models}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    loading={modelsLoading}
                    disabled={loading}
                  />

                  {/* File Upload Section */}
                  <FileUploader
                    file={file}
                    onFileChange={handleFileChange}
                    disabled={loading}
                  />

                  {/* Upload Button */}
                  <div className="text-center">
                    <button
                      onClick={handleUpload}
                      disabled={loading || !file || modelsLoading}
                      className="btn btn-success btn-lg px-5 py-3"
                      aria-label={loading ? "Processing PDF..." : "Parse PDF"}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing PDF...
                        </>
                      ) : (
                        <>
                          <i
                            className="bi bi-play-circle me-2"
                            aria-hidden="true"
                          ></i>
                          Parse PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div
                      className="alert alert-danger border-0 shadow-sm"
                      role="alert"
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className="bi bi-exclamation-triangle-fill me-2 fs-5"
                          aria-hidden="true"
                        ></i>
                        <div>
                          <strong>Error:</strong> {error}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Output Display */}
                  {output && file && (
                    <OutputViewer content={output} filename={file.name} />
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
