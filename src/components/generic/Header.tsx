const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img
              src="https://bastionresearch.in/wp-content/uploads/2023/03/BASTION-RESEARCH-_-logo-min-e1680501100187-190x45.png"
              alt="Bastion Research"
              className="h-10"
            />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Bastion CORE
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Knowledge Center
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-red-600 flex items-center transition-colors"
            >
              <span className="mr-1">👤</span> Login
            </a>
            <a
              href="#"
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Contact Us
            </a>
          </nav>
        </div>
      </div>
    </header>

  )
}

export default Header
