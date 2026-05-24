import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth, AuthProvider } from "./hooks/useAuth.jsx"
import { ToastProvider } from "./components/Toast.jsx"
import Login from "./pages/auth/Login"
import DashboardSecretaire from "./pages/auth/DashbordSecretaire"
import DashboardMedecinChef from "./pages/auth/DashboardMedecinChef"
import DashboardMedecin from "./pages/auth/DashboardMedecin"
import DashboardLaboratoire from "./pages/auth/DashboardLaboratoire"
import DashboardSoinsInfirmiers from "./pages/auth/DashboardSoinsInfirmiers"
import DashboardComptabilite from "./pages/auth/DashboardComptabilite"
import { ClinicSettingsProvider } from "./hooks/useClinicSettings.jsx"
import { SharedDataProvider } from "./hooks/useSharedData.jsx"
import PrivateRoute from "./components/PrivateRoute.jsx"

function AppRoutes() {
  const { user, loading } = useAuth()

  // ✅ Attendre que le localStorage soit lu avant de rediriger
  if (loading) return null

  const defaultRoute = user?.route || "/login"

  return (
    <Routes>
      <Route path="/"       element={<Navigate to={defaultRoute} replace />} />
      <Route path="/login"  element={<Login />} />

      <Route path="/secretaire" element={
        <PrivateRoute role="secretaire"><DashboardSecretaire /></PrivateRoute>
      }/>
      <Route path="/medecin-chef" element={
        <PrivateRoute role="medecin_chef"><DashboardMedecinChef /></PrivateRoute>
      }/>
      <Route path="/medecin" element={
        <PrivateRoute role="medecin"><DashboardMedecin /></PrivateRoute>
      }/>
      <Route path="/laboratoire" element={
        <PrivateRoute role="laborantin"><DashboardLaboratoire /></PrivateRoute>
      }/>
      <Route path="/soins-infirmiers" element={
        <PrivateRoute role="infirmier"><DashboardSoinsInfirmiers /></PrivateRoute>
      }/>
      <Route path="/comptabilite" element={
        <PrivateRoute role="comptable"><DashboardComptabilite /></PrivateRoute>
      }/>

      {/* Toute route inconnue → login ou dashboard selon l'état */}
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  )
}

// ✅ BrowserRouter est maintenant en dehors de AuthProvider
//    pour éviter que useAuth() lise user avant que le router soit prêt
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ClinicSettingsProvider>
            <SharedDataProvider>
              <AppRoutes />
            </SharedDataProvider>
          </ClinicSettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App