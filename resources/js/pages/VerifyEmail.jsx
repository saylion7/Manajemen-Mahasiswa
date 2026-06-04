import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { auth } from '../services/api';

const VerifyEmail = () => {
    const { user, fetchUser } = useAuth();
    const { dark, toggle } = useTheme();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const pollingRef = useRef(null);

    useEffect(() => {
        if (user?.email_verified_at) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        pollingRef.current = setInterval(async () => {
            try {
                const res = await auth.user();
                if (res.data.data?.email_verified_at) {
                    clearInterval(pollingRef.current);
                    await fetchUser();
                    navigate('/dashboard');
                }
            } catch {
                //
            }
        }, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const handleVerify = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await auth.verifyEmail();
            await fetchUser();
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verifikasi gagal');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await auth.resendVerification();
            setMessage('Kode verifikasi telah dikirim ulang');
            setResendCooldown(600);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim ulang');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-indigo-600">SIAKAD</Link>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Verifikasi Email</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="flex justify-end mb-2">
                        <button onClick={toggle}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" title={dark ? 'Mode Terang' : 'Mode Gelap'}>
                            {dark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📧</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Verifikasi Email Anda</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Kami telah mengirim link verifikasi ke <strong className="text-gray-900 dark:text-gray-100">{user?.email}</strong>. 
                        Buka email Anda dan klik link verifikasi, halaman ini akan otomatis mendeteksi dan mengarahkan ke dashboard.
                    </p>
                    {message && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-lg">{message}</div>}
                    {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}
                    <div className="space-y-3">
                        <button onClick={handleVerify} disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Memproses...' : 'Saya sudah verifikasi email'}
                        </button>
                        <button onClick={handleResend} disabled={loading || resendCooldown > 0}
                            className="w-full py-2.5 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-600 disabled:opacity-50">
                            {resendCooldown > 0
                                ? `Kirim ulang (${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')})`
                                : 'Kirim ulang email verifikasi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
