import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={
          <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Abnormal File Vault Manager</h1>
                  <a
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    ← Back to Home
                  </a>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="space-y-6">
                  <div className="bg-white shadow sm:rounded-lg">
                    <FileUpload onUploadSuccess={() => {}} />
                  </div>
                  <div className="bg-white shadow sm:rounded-lg">
                    <FileList />
                  </div>
                </div>
              </div>
            </main>
          </div>
        } />
        <Route path="/analytics" element={
          <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                  <a
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    ← Back to Home
                  </a>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Dashboard />
            </main>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Abnormal File Vault Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </Router>
  );
}

export default App;
