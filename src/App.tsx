import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from './contexts/UserContext';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import './App.css';
import { ThemeProvider } from "@/componentsUX/theme-provider"




function App() {
  return (
    <UserProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
    </UserProvider>
  );
}

export default App;