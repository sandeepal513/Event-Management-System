import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import ForgotPassword from './pages/auth/forgotPassword';
import OrganizerPage from './pages/organizer/OrganizerPage';
import AdminPage from './pages/admin/AdminPage';

import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import StudentPage from './pages/student/StudentPage';

function App() {

  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgotPassword" element={<ForgotPassword />} />
          <Route path="/admin/*" element={<AdminPage />} />



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
      </div>
    </BrowserRouter>
  );
}

export default App;