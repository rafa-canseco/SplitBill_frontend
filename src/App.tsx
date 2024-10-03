import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from './contexts/UserContext';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;