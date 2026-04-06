import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import ForgotPassword from './pages/auth/forgotPassword';
import OrganizerPage from './pages/organizer/OrganizerPage';
import Home from './pages/home';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<LoginPage />} path="auth/login" />
          <Route element={<RegisterPage />} path="auth/register" />
          <Route element={<ForgotPassword />} path="auth/forgotPassword" />
          <Route element={<OrganizerPage />} path="organizer/*" />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App