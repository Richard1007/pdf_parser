import React, { useCallback } from "react";
import { validateFile, formatFileSize } from "../utils/helpers";

interface FileUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  file,
  onFileChange,
  disabled = false,
}) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;

      if (selectedFile) {
        const validationError = validateFile(selectedFile);
        if (validationError) {
          alert(validationError);
          return;
        }
      }

      onFileChange(selectedFile);
    },
    [onFileChange]
  );

  return (
    <div className="border-3 border-dashed border-primary rounded-3 p-5 text-center bg-light">
      <div className="mb-3">
        <i
          className="bi bi-file-earmark-pdf display-4 text-primary"
          aria-hidden="true"
        ></i>
      </div>

      <h5 className="mb-3">Choose a PDF file to parse</h5>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="d-none"
        id="file-upload"
        disabled={disabled}
        aria-describedby="file-upload-help"
      />

      <label
        htmlFor="file-upload"
        className={`btn btn-primary btn-lg px-4 py-2 ${
          disabled ? "disabled" : ""
        }`}
        tabIndex={disabled ? -1 : 0}
      >
        <i className="bi bi-upload me-2" aria-hidden="true"></i>
        Select PDF File
      </label>

      <div id="file-upload-help" className="text-muted small mt-2">
        Maximum file size: 50MB
      </div>

      {file && (
        <div className="mt-3">
          <div className="alert alert-success d-inline-flex align-items-center">
            <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
            <div>
              <div className="small fw-bold">{file.name}</div>
              <div className="small text-muted">
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
