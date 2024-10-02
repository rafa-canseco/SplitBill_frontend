import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { usePrivy } from "@privy-io/react-auth"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import './App.css'

function App() {
  const { authenticated } = usePrivy();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard" 
          element={authenticated ? <Dashboard /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  )
}

export default App