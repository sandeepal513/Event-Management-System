import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import ForgotPassword from './pages/auth/forgotPassword';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <Routes>
          <Route element={<LoginPage />} path="auth/login" />
          <Route element={<RegisterPage />} path="auth/register" />
          <Route element={<ForgotPassword />} path="auth/forgotPassword" />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </BrowserRouter>
  )
}

export default App