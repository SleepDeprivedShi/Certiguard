import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ReviewQueue from './pages/ReviewQueue'
import SideBySide from './pages/SideBySide'
import ReportViewer from './pages/ReportViewer'
import UploadPage from './pages/UploadPage'
import CriteriaReview from './pages/CriteriaReview'

export default function App() {
  const [selectedTender, setSelectedTender] = useState<string>('')

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <Routes>
            <Route path="/" element={<Dashboard onSelectTender={setSelectedTender} />} />
            <Route path="/queue" element={<ReviewQueue tenderId={selectedTender} />} />
            <Route path="/review/:bidderId" element={<SideBySide tenderId={selectedTender} />} />
            <Route path="/report" element={<ReportViewer tenderId={selectedTender} />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/criteria/:tenderId" element={<CriteriaReview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}