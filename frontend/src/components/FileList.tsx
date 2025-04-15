import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileService, FileType, FileFilterParams } from '../services/fileService';
import { FileSearch } from './FileSearch';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const FileList: React.FC = () => {
  const [filters, setFilters] = useState<FileFilterParams>({});
  const queryClient = useQueryClient();

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['files', filters],
    queryFn: () => fileService.getFiles(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const handleSearch = (newFilters: FileFilterParams) => {
    setFilters(newFilters);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading files</div>;

  return (
    <div className="space-y-4">
      <FileSearch onSearch={handleSearch} files={files || []} />
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {files?.map((file: FileType) => (
            <li key={file.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.original_filename}
                  </p>
                  <p className="text-sm text-gray-500">
                    {file.file_type} • {formatFileSize(file.size)} • Uploaded {formatDate(file.uploaded_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => fileService.downloadFile(file.file, file.original_filename)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {files?.length === 0 && (
            <li className="px-6 py-4 text-center text-gray-500">
              No files found matching your criteria
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}; 