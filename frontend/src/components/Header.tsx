import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📦</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">App Wrapper Store</h1>
              <p className="text-sm text-gray-500">Create Android/iOS apps from websites</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/leoninnovaid/app-wrapper-store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              GitHub
            </a>
            <a
              href="https://github.com/leoninnovaid/app-wrapper-store/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
