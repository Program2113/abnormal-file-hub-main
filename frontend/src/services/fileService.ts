import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface FileType {
  id: string;
  file: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
}

export interface FileFilterParams {
  filename?: string;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  start_date?: string;
  end_date?: string;
  selected_files?: string[];
}

export const fileService = {
  uploadFile: async (file: File): Promise<FileType> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async (filters?: FileFilterParams): Promise<FileType[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.filename) params.append('filename', filters.filename);
      if (filters.file_type) params.append('file_type', filters.file_type);
      if (filters.min_size) params.append('min_size', filters.min_size.toString());
      if (filters.max_size) params.append('max_size', filters.max_size.toString());
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.selected_files) {
        filters.selected_files.forEach(fileId => params.append('selected_files', fileId));
      }
    }
    const response = await axios.get(`${API_URL}/files/?${params.toString()}`);
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  downloadFile: async (fileUrl: string, filename: string): Promise<void> => {
    const response = await axios.get(fileUrl, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// Export individual functions for direct use
export const getStorageSavings = async (): Promise<number> => {
  console.log('fileService: Fetching storage savings...');
  const response = await axios.get(`${API_URL}/file-stats/`);
  console.log('fileService: Received storage savings:', response.data);
  return response.data.savings_bytes;
};

export const getFileStats = async (): Promise<{ total_files: number; total_size: number }> => {
  console.log('fileService: Fetching file stats...');
  const response = await axios.get(`${API_URL}/file-stats/`);
  console.log('fileService: Received file stats:', response.data);
  return {
    total_files: response.data.total_files,
    total_size: response.data.total_size,
  };
};

