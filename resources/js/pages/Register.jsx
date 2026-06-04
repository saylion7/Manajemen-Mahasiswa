import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const InputField = ({ name, label, type, hint, placeholder, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type || 'text'}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(name, e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${error ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
        {hint && !error && <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
);

const Register = () => {
    const { register } = useAuth();
    const { dark, toggle } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setLoading(true);
        try {
            await register(form);
            navigate('/verify-email');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message || 'Registrasi gagal');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold text-indigo-600">SIAKAD</Link>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Buat akun baru</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                    {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <InputField name="name" label="Nama" placeholder="Masukkan Nama Lengkap" value={form.name} onChange={handleChange} error={errors.name?.[0]} />
                        <InputField name="email" label="Email" type="email" placeholder=" email@example.com " value={form.email} onChange={handleChange} error={errors.email?.[0]} />
                        <InputField name="password" label="Password" type="password" placeholder="Minimal 8 Karakter" value={form.password} onChange={handleChange} error={errors.password?.[0]} />
                        <InputField name="password_confirmation" label="Konfirmasi Password" type="password" placeholder="Konfirmasi Password" value={form.password_confirmation} onChange={handleChange} error={errors.password_confirmation?.[0]} />
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                            {loading ? 'Memproses...' : 'Daftar'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Sudah punya akun? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
