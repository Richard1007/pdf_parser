import React from "react";
import { Model } from "../utils/api";

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  loading,
  disabled = false,
}) => {
  const selectedModelData = models.find((m) => m.value === selectedModel);

  return (
    <div className="bg-light border rounded-3 p-4">
      <h5 className="mb-3 text-primary">
        <i className="bi bi-cpu me-2" aria-hidden="true"></i>
        Select AI Model
      </h5>

      {loading ? (
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></div>
          Loading available models...
        </div>
      ) : (
        <div>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="form-select form-select-lg mb-2"
            disabled={disabled}
            aria-label="Select AI model for PDF parsing"
          >
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.name}
              </option>
            ))}
          </select>

          {selectedModelData && (
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
              {selectedModelData.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
