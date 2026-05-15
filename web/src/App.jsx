/**
 * MyRuta Web - Main App Component
 * 
 * Responsibilities:
 * - Set up routing for different roles
 * - Initialize context providers
 * - Handle authentication state
 * 
 * ROUTING STRATEGY:
 * - Public Routes: Consultar rutas, horarios (sin login)
 * - Protected Routes: Admin dashboard (con login + ADMIN role)
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminLiveMap from './pages/admin/LiveMap'
import AdminReportes from './pages/admin/Reportes'
import AdminRutas from './pages/admin/GestionRutas'
import AdminConductores from './pages/admin/GestionConductores'

// Cliente Pages (Public Access)
import ClienteHome from './pages/cliente/Home'
import ClienteConsultaRutas from './pages/cliente/ConsultaRutas'
import ClienteTiempos from './pages/cliente/TiemposEstimados'

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen bg-dark-900 text-white flex flex-col overflow-x-hidden">
            {/* Grid background effect */}
            <div className="fixed inset-0 opacity-5 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px'
              }}>
            </div>

            {/* Navigation Bar - appears on all pages */}
            <Navbar />
            
            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
              <Routes>
                {/* ==================== PUBLIC ROUTES ==================== */}
                {/* Default: Show available routes without login */}
                <Route path="/" element={<ClienteConsultaRutas />} />
                
                {/* Public client pages */}
                <Route path="/cliente/home" element={<ClienteHome />} />
                <Route path="/cliente/rutas" element={<ClienteConsultaRutas />} />
                <Route path="/cliente/tiempos" element={<ClienteTiempos />} />

                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* ==================== PROTECTED ROUTES ==================== */}
                {/* Admin Routes - Require ADMIN role */}
                <Route 
                  path="/admin/dashboard" 
                  element={<ProtectedRoute element={<AdminDashboard />} requiredRoles={['ADMIN']} />} 
                />
                <Route 
                  path="/admin/mapa-vivo" 
                  element={<ProtectedRoute element={<AdminLiveMap />} requiredRoles={['ADMIN']} />} 
                />
                <Route 
                  path="/admin/reportes" 
                  element={<ProtectedRoute element={<AdminReportes />} requiredRoles={['ADMIN']} />} 
                />
                <Route 
                  path="/admin/rutas" 
                  element={<ProtectedRoute element={<AdminRutas />} requiredRoles={['ADMIN']} />} 
                />
                <Route 
                  path="/admin/conductores" 
                  element={<ProtectedRoute element={<AdminConductores />} requiredRoles={['ADMIN']} />} 
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </LocationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
