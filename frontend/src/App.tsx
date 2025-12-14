import { Link, Route, Routes } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { AboutPage } from "./pages/AboutPage"
import { NotFoundPage } from "./pages/NotFoundPage"


export function App() {

  return (
    <div>
      <nav className="fixed top-0 left-0 h-16 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo/Brand */}
            <div className="shrink-0">
              <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Interactive Health Edu
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="flex space-x-8">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}
