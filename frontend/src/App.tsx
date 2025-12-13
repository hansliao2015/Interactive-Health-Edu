import { Link, Route, Routes } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { AboutPage } from "./pages/AboutPage"
import { NotFoundPage } from "./pages/NotFoundPage"


export function App() {

  return (
    <div>
      <nav className="fixed top-0 left-0 h-16 w-full z-50 bg-gray-200 border-b border-gray-300">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
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
