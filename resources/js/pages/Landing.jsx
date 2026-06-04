import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const animationStyles = `
@keyframes fade-in-up {
    from { transform: translateY(80px) scale(0.92); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes fade-in-down {
    from { transform: translateY(-24px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
.anim-fade-in {
    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms) both;
    will-change: transform, opacity;
}
.anim-fade-in-down {
    animation: fade-in-down 0.6s ease-out both;
}`;

const styleEl = document.createElement('style');
styleEl.textContent = animationStyles;
document.head.appendChild(styleEl);

const FadeIn = ({ children, className, delay = 0 }) => (
    <div
        className={`${className || ''} anim-fade-in`}
        style={{ '--delay': `${delay}ms` }}
    >
        {children}
    </div>
);

const StaggerChildren = ({ children, className }) => (
    <div className={className}>
        {React.Children.map(children, (child, i) =>
            React.cloneElement(child, {
                ...child.props,
                style: {
                    ...child.props.style,
                    '--delay': `${i * 100}ms`,
                },
                className: `${child.props.className || ''} anim-fade-in`,
            })
        )}
    </div>
);

const features = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        title: 'Manajemen Data',
        desc: 'CRUD data mahasiswa lengkap dengan validasi input otomatis menggunakan Regex.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        title: 'Pencarian Cerdas',
        desc: 'Linear Search, Binary Search, dan Sequential Search untuk hasil akurat dan cepat.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
        ),
        title: 'Pengurutan Data',
        desc: 'Insertion, Selection, Bubble, Merge, dan Shell Sort pada berbagai field data.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        title: 'File I/O',
        desc: 'Ekspor dan impor data mahasiswa ke format CSV dengan satu klik.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        title: 'Keamanan',
        desc: 'Autentikasi dengan Laravel Sanctum dan verifikasi email untuk keamanan akun.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Time Complexity',
        desc: 'Estimasi kompleksitas waktu untuk setiap algoritma yang digunakan secara real-time.',
    },
];

const algorithms = [
    {
        category: 'Algoritma Pencarian',
        items: [
            { name: 'Linear Search', best: 'O(1)', worst: 'O(n)', desc: 'Membandingkan setiap elemen satu per satu' },
            { name: 'Binary Search', best: 'O(1)', worst: 'O(log n)', desc: 'Membagi data menjadi dua setiap iterasi (data harus terurut)' },
            { name: 'Sequential Search', best: 'O(1)', worst: 'O(n)', desc: 'Mencari elemen pertama yang cocok secara berurutan' },
        ],
    },
    {
        category: 'Algoritma Pengurutan',
        items: [
            { name: 'Insertion Sort', best: 'O(n)', worst: 'O(n\u00B2)', desc: 'Menyisipkan elemen satu per satu ke posisi yang tepat' },
            { name: 'Selection Sort', best: 'O(n\u00B2)', worst: 'O(n\u00B2)', desc: 'Memilih elemen terkecil dan menukar dengan posisi sesuai' },
            { name: 'Bubble Sort', best: 'O(n)', worst: 'O(n\u00B2)', desc: 'Membandingkan dan menukar elemen bertetangga' },
            { name: 'Merge Sort', best: 'O(n log n)', worst: 'O(n log n)', desc: 'Divide-and-conquer dengan membagi dan menggabungkan' },
            { name: 'Shell Sort', best: 'O(n log n)', worst: 'O(n(log n)\u00B2)', desc: 'Varian Insertion Sort dengan gap' },
        ],
    },
];

const Landing = () => {
    const { dark, toggle } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 anim-fade-in-down">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <span className="text-xl font-bold text-indigo-600">SIAKAD</span>
                    <div className="hidden sm:flex items-center gap-3">
                        <button onClick={toggle}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title={dark ? 'Mode Terang' : 'Mode Gelap'}>
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
                        <Link to="/login"
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Masuk
                        </Link>
                        <Link to="/register"
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all">
                            Daftar
                        </Link>
                    </div>
                    <div className="flex sm:hidden items-center gap-2">
                        <button onClick={toggle}
                            className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" title={dark ? 'Mode Terang' : 'Mode Gelap'}>
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
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="sm:hidden pb-3 border-t border-gray-100 dark:border-gray-800 px-4 pt-2 space-y-1 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
                        <Link to="/login" onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Masuk
                        </Link>
                        <Link to="/register" onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 text-center transition-colors">
                            Daftar
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute top-20 right-0 w-64 h-64 bg-purple-200/30 dark:bg-purple-500/5 rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-indigo-200/30 dark:bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6 anim-fade-in"
                        style={{ '--delay': '200ms' }}>
                        Manajemen Data
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient">
                            Mahasiswa
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0 anim-fade-in"
                        style={{ '--delay': '350ms' }}>
                        Sistem informasi terintegrasi untuk mengelola data mahasiswa dengan berbagai algoritma 
                        pencarian dan pengurutan. Cepat, akurat, dan terorganisir.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 anim-fade-in"
                        style={{ '--delay': '500ms' }}>
                        <Link to="/register"
                            className="group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-150 sm:duration-300 hover:shadow-2xl hover:shadow-indigo-300/50 hover:-translate-y-1.5 active:scale-95 text-center text-sm sm:text-base">
                            <span className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative">Mulai Sekarang</span>
                        </Link>
                        <Link to="/login"
                            className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-200/50 active:scale-95 transition-all duration-150 sm:duration-300 text-center text-sm sm:text-base">
                            Masuk ke Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <StaggerChildren className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                        { value: '3', label: 'Algoritma Pencarian' },
                        { value: '5', label: 'Algoritma Pengurutan' },
                        { value: '100%', label: 'Berbasis Web' },
                    ].map((stat) => (
                        <div key={stat.label}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-6 text-center hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 hover:border-indigo-300 active:shadow-2xl active:shadow-indigo-200/50 active:-translate-y-2 active:border-indigo-300 transition-all duration-150 sm:duration-300">
                            <div className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 group-active:text-indigo-800 dark:group-active:text-indigo-300 transition-colors">{stat.value}</div>
                            <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-tight sm:leading-normal group-hover:text-gray-700 dark:group-hover:text-gray-300 group-active:text-gray-700 dark:group-active:text-gray-300 transition-colors">{stat.label}</div>
                        </div>
                    ))}
                </StaggerChildren>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <FadeIn>
                    <div className="text-center mb-10 sm:mb-14">
                        <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Fitur Unggulan</h2>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4 sm:px-0">
                            Berbagai fitur dirancang untuk memudahkan pengelolaan data akademik Anda.
                        </p>
                    </div>
                </FadeIn>
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature) => (
                        <div key={feature.title}
                            className="group p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-3 active:border-indigo-400 dark:active:border-indigo-400 active:shadow-2xl active:shadow-indigo-200/50 dark:active:shadow-indigo-900/20 active:-translate-y-3 transition-all duration-150 sm:duration-300">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:scale-[1.6] group-hover:-rotate-6 group-hover:shadow-lg group-hover:shadow-indigo-200/50 group-active:bg-indigo-100 dark:group-active:bg-indigo-900/50 group-active:scale-[1.6] group-active:-rotate-6 group-active:shadow-lg group-active:shadow-indigo-200/50 transition-all duration-150 sm:duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 group-active:text-indigo-700 dark:group-active:text-indigo-400 transition-colors">{feature.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 group-active:text-gray-700 dark:group-active:text-gray-300 transition-colors">{feature.desc}</p>
                        </div>
                    ))}
                </StaggerChildren>
            </section>

            {/* Algorithms */}
            <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center mb-10 sm:mb-14">
                            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Algoritma yang Diimplementasikan</h2>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-4 sm:px-0">
                                Setiap algoritma dilengkapi analisis kompleksitas waktu Best Case dan Worst Case.
                            </p>
                        </div>
                    </FadeIn>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {algorithms.map((group, gi) => (
                            <FadeIn key={group.category} delay={gi * 100}>
                                    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-200/50 hover:border-indigo-300 dark:hover:border-indigo-400 active:shadow-2xl active:shadow-indigo-200/50 active:border-indigo-300 dark:active:border-indigo-400 transition-all duration-150 sm:duration-300">
                                    <div className="flex items-center gap-3 mb-5 sm:mb-8">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-indigo-200/50 group-active:scale-125 group-active:shadow-lg group-active:shadow-indigo-200/50 transition-all duration-150 sm:duration-300 shrink-0">
                                            {group.category === 'Algoritma Pencarian' ? (
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 group-active:text-indigo-700 dark:group-active:text-indigo-400 transition-colors">{group.category}</h3>
                                        <span className="ml-auto text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-active:text-indigo-500 dark:group-active:text-indigo-400 transition-colors">{group.items.length} algoritma</span>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {group.items.map((algo, ai) => (
                                            <div key={algo.name}
                                                className="relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-1 active:bg-indigo-50 dark:active:bg-indigo-900/20 active:shadow-lg active:shadow-indigo-200/50 active:-translate-y-1 transition-all duration-150 sm:duration-300">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:scale-110 group-active:bg-indigo-100 dark:group-active:bg-indigo-900/50 group-active:text-indigo-600 dark:group-active:text-indigo-400 group-active:border-indigo-300 dark:group-active:border-indigo-500 group-active:scale-110 transition-all duration-150 sm:duration-300">
                                                    {String(ai + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
                                                        <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-active:text-indigo-700 dark:group-active:text-indigo-300 transition-colors duration-150 sm:duration-300">{algo.name}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 whitespace-nowrap">
                                                                Best {algo.best}
                                                            </span>
                                                            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 whitespace-nowrap">
                                                                Worst {algo.worst}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 group-active:text-gray-700 dark:group-active:text-gray-300 transition-colors duration-150 sm:duration-300">{algo.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <FadeIn>
                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-12 text-center text-white shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative">
                            <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">Siap untuk Mencoba?</h2>
                            <p className="text-indigo-100 text-sm sm:text-base max-w-lg mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
                                Daftar sekarang dan kelola data akademik dengan lebih efisien menggunakan berbagai algoritma pilihan.
                            </p>
                            <Link to="/register"
                                className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-200/50 active:scale-95 transition-all duration-150 sm:duration-300 shadow-lg text-sm sm:text-base">
                                Daftar Gratis
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-gray-800 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} SIAKAD. All rights reserved.
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
