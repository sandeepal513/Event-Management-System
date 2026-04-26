import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import Home from './pages/Home';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import ForgotPassword from './pages/auth/forgotPassword';
import VerifyMail from './pages/auth/verifyMail';
import Logout from './pages/auth/logout';

import ProtectedRoute from './components/ProtectedRoute';
import OrganizerPage from './pages/organizer/OrganizerPage';
import AdminPage from './pages/admin/AdminPage';
import StudentPage from './pages/student/StudentPage';

import SearchPage from './pages/SearchPage';
import SearchEventDetailsPage from './pages/SearchEventDetailsPage';

function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <div className="w-full h-screen">
      <Toaster position="top-right" />

      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/verifymail" element={<VerifyMail />} />
        <Route path="/auth/forgotPassword" element={<ForgotPassword />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/events/:eventId" element={<SearchEventDetailsPage />} />
        <Route path="/events/:eventId" element={<SearchEventDetailsPage />} />
        <Route path="/logout" element={<Logout />} />


        {/* 🔒 Protected Route */}
        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/logout" element={<Logout />} />
        </Routes>
      )}
    </div>
  );
}

export default App;