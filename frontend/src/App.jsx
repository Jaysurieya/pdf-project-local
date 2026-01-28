import DashboardMain from './components/Dashboard_main/DashboardMain'
import Upload from './components/Upload/Upload'
import ScanToPdf from './components/Upload/ScanToPdf'
import MobileScan from './components/Upload/MobileScan'
import ScanDesktopView from './components/Upload/ScanDesktopView'
import EditPdfEditor from "./components/Upload/EditPdfEditor"

import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardMain />} />

      <Route path="/tool/scan-to-pdf" element={<ScanToPdf />} />

      {/* ✅ EDIT PDF separate route */}
      <Route path="/tool/edit-pdf" element={<EditPdfEditor />} />

      {/* ✅ all other tools handled by Upload */}
      <Route path="/tool/:tool" element={<Upload />} />

      <Route path="/mobile-scan" element={<MobileScan />} />
      <Route path="/scan-desktop" element={<ScanDesktopView />} />
    </Routes>
  )
}

export default App
