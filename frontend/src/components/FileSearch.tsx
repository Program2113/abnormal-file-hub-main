import React, { useState, useEffect } from 'react';
import { FileFilterParams } from '../services/fileService';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

interface FileSearchProps {
  onSearch: (filters: FileFilterParams) => void;
  files: Array<{ id: string; original_filename: string; file_type: string }>;
}

const FILE_TYPES = [
  { id: 'all', label: 'All', icon: DocumentTextIcon },
  { id: 'image', label: 'Images', icon: PhotoIcon },
  { id: 'document', label: 'Documents', icon: DocumentIcon },
  { id: 'text', label: 'Text', icon: DocumentTextIcon },
  { id: 'spreadsheet', label: 'Spreadsheets', icon: TableCellsIcon },
  { id: 'other', label: 'Other', icon: DocumentChartBarIcon },
];

export const FileSearch: React.FC<FileSearchProps> = ({ onSearch, files }) => {
  const [filters, setFilters] = useState<FileFilterParams>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState<FileFilterParams>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter files based on search query and file type
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchQuery || file.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !tempFilters.file_type || tempFilters.file_type === 'all' || file.file_type === tempFilters.file_type;
    console.log('File:', file.original_filename, 'Type:', file.file_type, 'Filter:', tempFilters.file_type, 'Matches:', matchesType);
    return matchesSearch && matchesType;
  });

  const handleInputChange = (field: string, value: string) => {
    console.log('Input change:', field, value);
    setTempFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    console.log('Applying filters:', tempFilters, 'searchQuery:', searchQuery, 'selectedFiles:', selectedFiles);
    
    // Create a new filters object with all current filters
    const newFilters: FileFilterParams = {
      filename: searchQuery || undefined,
      file_type: tempFilters.file_type && tempFilters.file_type !== 'all' ? tempFilters.file_type : undefined,
      min_size: tempFilters.min_size ? Number(tempFilters.min_size) * 1024 * 1024 : undefined,
      max_size: tempFilters.max_size ? Number(tempFilters.max_size) * 1024 * 1024 : undefined,
      start_date: tempFilters.start_date || undefined,
      end_date: tempFilters.end_date || undefined,
      selected_files: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    // Remove undefined values
    Object.keys(newFilters).forEach(key => 
      newFilters[key as keyof FileFilterParams] === undefined && delete newFilters[key as keyof FileFilterParams]
    );
    
    console.log('Final filters being sent:', newFilters);
    
    // Update the filters and close the panel
    setFilters(newFilters);
    onSearch(newFilters);
    setIsExpanded(false);
  };
  

  const handleReset = () => {
    setTempFilters({});
    setFilters({});
    setSearchQuery('');
    setSelectedFiles([]);
    onSearch({});
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-10"
         style={{ width: isExpanded ? '300px' : '60px' }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute right-0 top-4 p-2 rounded-full hover:bg-gray-100"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <FunnelIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded ? (
        <div className="h-full flex flex-col">
          {/* Search bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Search results */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => toggleFileSelection(file.id)}
              >
                <span className="text-sm truncate">{file.original_filename}</span>
                {selectedFiles.includes(file.id) ? (
                  <CheckIcon className="h-5 w-5 text-blue-500" />
                ) : null}
              </div>
            ))}
          </div>

          {/* File type filters */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">File Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {FILE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInputChange('file_type', type.id)}
                  className={`flex items-center justify-center p-2 rounded-lg border ${
                    tempFilters.file_type === type.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <type.icon className="h-5 w-5 mr-2" />
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size range */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Size Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Size (MB)</label>
                <input
                  type="number"
                  value={tempFilters.min_size || ''}
                  onChange={(e) => handleInputChange('min_size', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Size (MB)</label>
                <input
                  type="number"
                  value={tempFilters.max_size || ''}
                  onChange={(e) => handleInputChange('max_size', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempFilters.start_date || ''}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempFilters.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {hasActiveFilters && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedFiles.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 