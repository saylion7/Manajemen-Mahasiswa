import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/students" element={<Students />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
                </ThemeProvider>
            </ToastProvider>
        </AuthProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
