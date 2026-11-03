import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Activities from './pages/Activities';
import Gallery from './pages/Gallery';
import Team from './pages/Team';
import Join from './pages/Join';
import Events from './pages/Events';
import Queries from './pages/Queries';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { RescueProvider } from './context/RescueContext';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <RescueProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/events" element={<Events />} />
              <Route path="/queries" element={<Queries />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/team" element={<Team />} />
              <Route path="/join" element={<Join />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
            <Footer />
            <Toaster />
          </RescueProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
