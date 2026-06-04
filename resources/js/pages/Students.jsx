import React, { useState, useEffect, useRef, useCallback } from 'react';
import { students } from '../services/api';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';

const INITIAL_FORM = { nim: '', name: '', email: '', phone: '', address: '', major: '', faculty: '', gpa: '', semester: '1', status: 'active' };
const ALGORITHMS = {
    search: ['linear', 'binary', 'sequential'],
    sort: ['insertion', 'selection', 'bubble', 'merge', 'shell'],
};
const FIELDS = ['name', 'nim', 'email', 'major', 'gpa', 'semester'];

const InputField = ({ name, label, type, step, value, onChange, error, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type={type || 'text'}
            step={step}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${error ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

const Students = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');
    const errorTimer = useRef(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchMethod, setSearchMethod] = useState('linear');
    const [searchField, setSearchField] = useState('name');
    const [searchMeta, setSearchMeta] = useState(null);
    const debounceRef = useRef(null);

    const [sortAlgorithm, setSortAlgorithm] = useState('insertion');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortMeta, setSortMeta] = useState(null);

    const [filters, setFilters] = useState({ major: '', faculty: '', status: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { showToast } = useToast();

    const showError = (msg) => {
        setError(msg);
        if (errorTimer.current) clearTimeout(errorTimer.current);
        errorTimer.current = setTimeout(() => setError(''), 5000);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.major) params.major = filters.major;
            if (filters.faculty) params.faculty = filters.faculty;
            if (filters.status) params.status = filters.status;
            const res = await students.all(params);
            setData(res.data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchAll(); return () => { if (errorTimer.current) clearTimeout(errorTimer.current); }; }, [fetchAll]);

    const doSearch = useCallback(async (keyword) => {
        if (!keyword.trim()) {
            setSearchMeta(null);
            fetchAll();
            return;
        }
        setLoading(true);
        try {
            const res = await students.search({ keyword, method: searchMethod, field: searchField });
            setData(res.data.data || []);
            setSearchMeta(res.data.meta);
        } catch (err) { showError(err.response?.data?.message || 'Pencarian gagal'); } finally { setLoading(false); }
    }, [searchMethod, searchField]);

    const handleSearchInput = (value) => {
        setSearchKeyword(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 300);
    };

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleSort = async () => {
        setLoading(true);
        try {
            const res = await students.sort({ algorithm: sortAlgorithm, field: sortField, order: sortOrder });
            setData(res.data.data || []);
            setSortMeta(res.data.meta);
        } catch (err) { showError(err.response?.data?.message || 'Pengurutan gagal'); } finally { setLoading(false); }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(students.exportUrl(), {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Gagal mengekspor');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.headers.get('Content-Disposition')?.match(/filename="?(.+?)"?$/)?.[1] || 'students.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormErrors({});
        setLoading(true);
        try {
            if (editing) {
                await students.update(editing, form);
                showToast('Data berhasil diperbarui', 'success');
            } else {
                await students.create(form);
                showToast('Data berhasil ditambahkan', 'success');
            }
            setShowForm(false);
            setEditing(null);
            setForm(INITIAL_FORM);
            setSearchKeyword('');
            setSearchMeta(null);
            const res = await students.all();
            setData(res.data.data || []);
        } catch (err) {
            if (err.response?.status === 422) {
                setFormErrors(err.response.data.errors || {});
            } else {
                showError(err.response?.data?.message || 'Gagal menyimpan data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await students.find(id);
            const s = res.data.data;
            setForm({
                nim: s.nim, name: s.name, email: s.email, phone: s.phone || '',
                address: s.address || '', major: s.major, faculty: s.faculty,
                gpa: String(s.gpa), semester: String(s.semester), status: s.status,
            });
            setEditing(id);
            setShowForm(true);
            setFormErrors({});
        } catch (err) { showError(err.response?.data?.message || 'Gagal memuat data mahasiswa'); }
    };

    const handleDelete = async (id) => {
        setConfirmDelete(null);
        setLoading(true);
        try {
            await students.delete(id);
            showToast('Data berhasil dihapus', 'success');
            setSearchKeyword('');
            setSearchMeta(null);
            const res = await students.all();
            setData(res.data.data || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal menghapus data');
        } finally {
            setLoading(false);
        }
    };

    const resetAll = () => {
        setSearchKeyword('');
        setSearchMeta(null);
        setSortMeta(null);
        setFilters({ major: '', faculty: '', status: '' });
        setSortAlgorithm('insertion');
        setError('');
        fetchAll();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Data Mahasiswa</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola data mahasiswa</p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer whitespace-nowrap">Export CSV</button>
                    <button onClick={() => { setForm(INITIAL_FORM); setEditing(null); setShowForm(true); setFormErrors({}); }}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap">+ Tambah</button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="font-bold ml-2 hover:text-red-800 dark:hover:text-red-300">&times;</button>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField name="nim" label="NIM" value={form.nim} onChange={handleChange} error={formErrors.nim?.[0]} />
                                <InputField name="name" label="Nama" value={form.name} onChange={handleChange} error={formErrors.name?.[0]} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField name="email" label="Email" type="email" value={form.email} onChange={handleChange} error={formErrors.email?.[0]} />
                                <InputField name="phone" label="Telepon" value={form.phone} onChange={handleChange} error={formErrors.phone?.[0]} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                                <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="2" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField name="major" label="Jurusan" value={form.major} onChange={handleChange} error={formErrors.major?.[0]} />
                                <InputField name="faculty" label="Fakultas" value={form.faculty} onChange={handleChange} error={formErrors.faculty?.[0]} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField name="gpa" label="IPK" type="number" step="0.01" value={form.gpa} onChange={handleChange} error={formErrors.gpa?.[0]} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                    <select value={form.semester} onChange={(e) => handleChange('semester', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        {[...Array(14)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <option value="active">Aktif</option>
                                        <option value="graduated">Lulus</option>
                                        <option value="dropped_out">Drop Out</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">Batal</button>
                                <button type="submit"
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pencarian</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <input value={searchKeyword} onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && doSearch(searchKeyword)}
                            placeholder="Ketik untuk mencari..." className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        <button onClick={() => doSearch(searchKeyword)} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">Cari</button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <select value={searchMethod} onChange={(e) => setSearchMethod(e.target.value)}
                            className="w-full sm:flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700">
                            {ALGORITHMS.search.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                        </select>
                        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}
                            className="w-full sm:flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700">
                            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    {searchMeta && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-500 dark:text-gray-400 break-words leading-relaxed">
                            <span className="font-medium">{searchMeta.method}</span> · {searchMeta.execution_time_ms}ms · 
                            Best: {searchMeta.time_complexity.best} · Worst: {searchMeta.time_complexity.worst}
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pengurutan</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <select value={sortAlgorithm} onChange={(e) => setSortAlgorithm(e.target.value)}
                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            {ALGORITHMS.sort.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)} Sort</option>)}
                        </select>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select value={sortField} onChange={(e) => setSortField(e.target.value)}
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm cursor-pointer shrink-0 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                            <button onClick={handleSort} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shrink-0">Urutkan</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <button onClick={resetAll} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">Reset Pencarian & Pengurutan</button>
                    </div>
                    {sortMeta && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-500 dark:text-gray-400 break-words leading-relaxed">
                            <span className="font-medium">{sortMeta.algorithm}</span> · {sortMeta.execution_time_ms}ms · 
                            Best: {sortMeta.time_complexity.best} · Worst: {sortMeta.time_complexity.worst}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 dark:text-gray-500">Memuat data...</div>
                ) : (data || []).length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500">{searchKeyword.trim() ? 'Data tidak ditemukan' : 'Tidak ada data mahasiswa'}</div>
                ) : (
                    <>
                        {/* Mobile: Card View */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 md:hidden">
                            {(data || []).map((s) => (
                                <div key={s.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{s.nim}</p>
                                        </div>
                                        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                            s.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            s.status === 'graduated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {s.status === 'active' ? 'Aktif' : s.status === 'graduated' ? 'Lulus' : 'DO'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <span className="truncate"><span className="text-gray-400 dark:text-gray-500">Email:</span> {s.email}</span>
                                        <span className="truncate"><span className="text-gray-400 dark:text-gray-500">Jurusan:</span> {s.major}</span>
                                        <span><span className="text-gray-400 dark:text-gray-500">IPK:</span> {s.gpa}</span>
                                        <span><span className="text-gray-400 dark:text-gray-500">Sem:</span> {s.semester}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(s.id)}
                                            className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer">Edit</button>
                                        <button onClick={() => setConfirmDelete(s.id)}
                                            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Table View */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">NIM</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Nama</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Email</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Jurusan</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">IPK</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Semester</th>
                                        <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Status</th>
                                        <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data || []).map((s) => (
                                        <tr key={s.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{s.nim}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{s.name}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{s.email}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">{s.major}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.gpa}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">Semester {s.semester}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                                                    s.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                    s.status === 'graduated' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}>
                                                    {s.status === 'active' ? 'Aktif' : s.status === 'graduated' ? 'Lulus' : 'DO'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(s.id)}
                                                        className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer whitespace-nowrap">Edit</button>
                                                    <button onClick={() => setConfirmDelete(s.id)}
                                                        className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer whitespace-nowrap">Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDelete !== null}
                title="Hapus Data"
                message="Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Hapus"
                confirmClass="bg-red-600 hover:bg-red-700"
                onConfirm={() => handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
                loading={loading}
            />
        </div>
    );
};

export default Students;
