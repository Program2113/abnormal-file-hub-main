import React, { useState } from 'react';
import { FileFilterParams } from '../services/fileService';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  FunnelIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

interface FileSearchProps {
  onSearch: (filters: FileFilterParams) => void;
  files: Array<{ id: string; original_filename: string; file_type: string }>;
}

export const FileSearch: React.FC<FileSearchProps> = ({ onSearch, files }) => {
  const [filters, setFilters] = useState<FileFilterParams>({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [tempFilters, setTempFilters] = useState<FileFilterParams>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.original_filename.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchQuery(value);
    } else {
      setTempFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApply = () => {
    // Create new filters object
    const newFilters = {
      ...tempFilters,
      selected_files: Array.from(selectedFiles)
    };

    // First minimize the pane
    setIsExpanded(false);

    // Then update filters and trigger search
    setFilters(newFilters);
    onSearch(newFilters);

    // Clear temp filters after a short delay to ensure UI updates are complete
    setTimeout(() => {
      setTempFilters({});
    }, 100);
  };

  const handleReset = () => {
    setTempFilters({});
    setFilters({});
    setSearchQuery('');
    setSelectedFiles(new Set());
    onSearch({});
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || selectedFiles.size > 0;
  const hasTempFilters = Object.keys(tempFilters).length > 0 || selectedFiles.size > 0;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-80' : 'w-12'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Search Bar - Only visible when expanded */}
      {isExpanded && (
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search files..."
            />
          </div>
        </div>
      )}

      {/* Search Results */}
      {isExpanded && debouncedSearchQuery && (
        <div className="px-4 py-2 max-h-60 overflow-y-auto">
          {filteredFiles.length > 0 ? (
            <div className="space-y-1">
              {filteredFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => toggleFileSelection(file.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                    selectedFiles.has(file.id)
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{file.original_filename}</span>
                  {selectedFiles.has(file.id) && (
                    <CheckIcon className="h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-sm text-gray-500">
              No files found
            </div>
          )}
        </div>
      )}

      {/* Filter Chips - Only visible when expanded */}
      {hasActiveFilters && isExpanded && (
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedFiles).map(fileId => {
              const file = files.find(f => f.id === fileId);
              return file ? (
                <span
                  key={fileId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {file.original_filename}
                  <button
                    onClick={() => toggleFileSelection(fileId)}
                    className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-primary-200"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {isExpanded && (
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-180px)]">
          {/* File Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTempFilters(prev => ({ ...prev, file_type: '' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  !tempFilters.file_type ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
              >
                <DocumentIcon className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1">All</span>
              </button>
              <button
                type="button"
                onClick={() => setTempFilters(prev => ({ ...prev, file_type: 'image' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  tempFilters.file_type === 'image' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
              >
                <PhotoIcon className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1">Images</span>
              </button>
              <button
                type="button"
                onClick={() => setTempFilters(prev => ({ ...prev, file_type: 'video' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  tempFilters.file_type === 'video' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
              >
                <VideoCameraIcon className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1">Videos</span>
              </button>
              <button
                type="button"
                onClick={() => setTempFilters(prev => ({ ...prev, file_type: 'text' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  tempFilters.file_type === 'text' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1">Text</span>
              </button>
            </div>
          </div>

          {/* Size Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size Range
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="min_size"
                  value={tempFilters.min_size || ''}
                  onChange={handleInputChange}
                  placeholder="Min (bytes)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  name="max_size"
                  value={tempFilters.max_size || ''}
                  onChange={handleInputChange}
                  placeholder="Max (bytes)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                name="start_date"
                value={tempFilters.start_date || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <input
                type="date"
                name="end_date"
                value={tempFilters.end_date || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Only visible when expanded */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Collapsed State - Only show when there are active filters */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {selectedFiles.size + Object.keys(filters).length}
          </span>
        </div>
      )}
    </div>
  );
}; 