import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'dashboard'>('home');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">File Hub</h1>
          <p className="mt-2 text-sm text-gray-600">Choose an option to continue</p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => setCurrentView('upload')}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            📤 File Upload
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            📊 View Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'upload':
        return (
          <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">File Upload</h1>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="space-y-6">
                  <div className="bg-white shadow sm:rounded-lg">
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                  </div>
                  <div className="bg-white shadow sm:rounded-lg">
                    <FileList key={refreshKey} />
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Dashboard />
            </main>
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 File Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
