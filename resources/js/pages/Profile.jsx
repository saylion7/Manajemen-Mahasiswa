import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[e.target.name];
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
            await auth.changePassword(form);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
            window.location.reload();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message || 'Gagal mengubah password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Pengaturan</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Kelola informasi akun Anda</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profil</h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nama</label>
                        <p className="text-gray-900 dark:text-gray-100">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ganti Password</h2>
                {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Masukkan Password Lama</label>
                        <input type="password" name="current_password" value={form.current_password} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        {errors.current_password?.[0] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.current_password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Masukkan Password Baru</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        {errors.password?.[0] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
                        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        {errors.password_confirmation?.[0] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                        {loading ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
