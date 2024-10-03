import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './App.css';
import { ThemeProvider } from '@/componentsUX/theme-provider';
import CreateSession from './pages/CreateSession';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <UserProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-session" element={<CreateSession />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
