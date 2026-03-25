import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoldPricesProvider } from './context/GoldPricesProvider'
import { AdminPage } from './pages/AdminPage'
import { GoldBoardPage } from './pages/GoldBoardPage'

function App() {
  return (
    <GoldPricesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GoldBoardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoldPricesProvider>
  )
}

export default App
