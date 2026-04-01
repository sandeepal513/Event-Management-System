import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/registerPage';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <Routes>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </BrowserRouter>
  )
}

export default App