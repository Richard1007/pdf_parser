const API_BASE_URL = 'http://localhost:8000';

export interface Model {
  value: string;
  name: string;
  description: string;
}

export interface ModelsResponse {
  models: Model[];
}

export interface UploadResponse {
  data: string;
}

export interface ApiErrorResponse {
  error: string;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json() as ApiErrorResponse;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use default error message
    }
    
    throw new ApiError(errorMessage, response.status);
  }
  
  return response.json();
}

export async function getModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    return handleResponse<ModelsResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch models. Please check your connection.');
  }
}

export async function uploadPDF(file: File, model: string): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('model', model);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<UploadResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload PDF. Please check your connection.');
  }
} 