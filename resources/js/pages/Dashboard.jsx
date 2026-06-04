import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { students, auth } from '../services/api';

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 sm:mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                <span className="text-lg sm:text-2xl">{icon}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, fetchUser } = useAuth();
    const [searchParams] = useSearchParams();
    const verified = searchParams.get('verified');
    const [stats, setStats] = useState({ total: 0, active: 0, graduated: 0, droppedOut: 0 });
    const [recentStudents, setRecentStudents] = useState([]);
    const [emailStatus, setEmailStatus] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchUser();
        loadStats();
    }, []);

    useEffect(() => {
        if (!user?.email_verified_at) {
            checkEmailStatus();
        } else {
            setEmailStatus('verified');
        }
    }, [user]);

    const loadStats = async () => {
        try {
            const res = await students.all();
            const data = res.data.data || [];
            setStats({
                total: data.length,
                active: data.filter((s) => s.status === 'active').length,
                graduated: data.filter((s) => s.status === 'graduated').length,
                droppedOut: data.filter((s) => s.status === 'dropped_out').length,
            });
            setRecentStudents(data.slice(-5).reverse());
        } catch {
            //
        }
    };

    const checkEmailStatus = async () => {
        try {
            const res = await auth.user();
            if (res.data.data?.email_verified_at) {
                setEmailStatus('verified');
                await fetchUser();
            } else {
                setEmailStatus('unverified');
            }
        } catch {
            setEmailStatus('unverified');
        }
    };

    const handleResendVerification = async () => {
        try {
            await auth.resendVerification();
            showToast('Email verifikasi telah dikirim ulang', 'success');
        } catch {
            showToast('Gagal mengirim ulang', 'error');
        }
    };

    return (
        <div>
            {verified === '1' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 text-sm font-medium">Email berhasil diverifikasi! Akun Anda sekarang aktif.</p>
                </div>
            )}
            {emailStatus === 'unverified' && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">Email Anda belum diverifikasi. Silakan cek email dan klik link verifikasi.</p>
                    <button onClick={handleResendVerification} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 shrink-0">
                        Kirim Ulang
                    </button>
                </div>
            )}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Selamat datang, {user?.name}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <StatCard label="Total Mahasiswa" value={stats.total} icon="🎓" color="bg-blue-100 dark:bg-blue-900/30" />
                <StatCard label="Aktif" value={stats.active} icon="✅" color="bg-green-100 dark:bg-green-900/30" />
                <StatCard label="Lulus" value={stats.graduated} icon="🎉" color="bg-purple-100 dark:bg-purple-900/30" />
                <StatCard label="Drop Out" value={stats.droppedOut} icon="⚠️" color="bg-red-100 dark:bg-red-900/30" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mahasiswa Terbaru</h2>
                    <Link to="/students" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">Lihat Semua →</Link>
                </div>
                {/* Mobile: Card View */}
                <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {(recentStudents || []).length === 0 ? (
                        <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">Belum ada data mahasiswa</div>
                    ) : (
                        (recentStudents || []).map((s) => (
                            <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{s.nim}</p>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                        s.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                        s.status === 'graduated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                        {s.status === 'active' ? 'Aktif' : s.status === 'graduated' ? 'Lulus' : 'DO'}
                                    </span>
                                </div>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Jurusan: {s.major}</span>
                                    <span>IPK: {s.gpa}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="text-left py-3 text-gray-500 dark:text-gray-400 font-medium">NIM</th>
                                <th className="text-left py-3 text-gray-500 dark:text-gray-400 font-medium">Nama</th>
                                <th className="text-left py-3 text-gray-500 dark:text-gray-400 font-medium">Jurusan</th>
                                <th className="text-left py-3 text-gray-500 dark:text-gray-400 font-medium">IPK</th>
                                <th className="text-left py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(recentStudents || []).map((s) => (
                                <tr key={s.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="py-3 font-mono text-sm text-gray-900 dark:text-gray-100">{s.nim}</td>
                                    <td className="py-3 text-gray-900 dark:text-gray-100">{s.name}</td>
                                    <td className="py-3 text-gray-500 dark:text-gray-400">{s.major}</td>
                                    <td className="py-3 text-gray-500 dark:text-gray-400">{s.gpa}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                                            s.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            s.status === 'graduated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {s.status === 'active' ? 'Aktif' : s.status === 'graduated' ? 'Lulus' : 'DO'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(recentStudents || []).length === 0 && (
                                <tr><td colSpan="5" className="py-8 text-center text-gray-400 dark:text-gray-500">Belum ada data mahasiswa</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
