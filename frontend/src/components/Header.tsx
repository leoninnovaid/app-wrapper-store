export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">AW</span>
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
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://github.com/leoninnovaid/app-wrapper-store/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
