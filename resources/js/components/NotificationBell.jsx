import React, { useState, useEffect, useRef, useCallback } from 'react';
import { notifications } from '../services/api';

const NotificationBell = () => {
    const [unread, setUnread] = useState(0);
    const [list, setList] = useState([]);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const ref = useRef(null);
    const polling = useRef(null);

    const fetchUnread = useCallback(async () => {
        try {
            const res = await notifications.unreadCount();
            setUnread(res.data.data.count);
        } catch {}
    }, []);

    const fetchList = useCallback(async (p = 1) => {
        try {
            const res = await notifications.all(p);
            const items = res.data.data;
            setList((prev) => (p === 1 ? items : [...prev, ...items]));
            setHasMore(res.data.meta.current_page < res.data.meta.last_page);
            setPage(p);
        } catch {}
    }, []);

    useEffect(() => {
        fetchUnread();
        polling.current = setInterval(fetchUnread, 10000);
        return () => clearInterval(polling.current);
    }, [fetchUnread]);

    useEffect(() => {
        if (open) fetchList(1);
    }, [open, fetchList]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notifications.markAllAsRead();
            setList((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            setUnread(0);
        } catch {}
    };

    const handleMarkRead = async (id) => {
        try {
            await notifications.markAsRead(id);
            setList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
            setUnread((u) => Math.max(0, u - 1));
        } catch {}
    };

    const ago = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'baru saja';
        if (mins < 60) return `${mins}m lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}j lalu`;
        return `${Math.floor(hours / 24)}h lalu`;
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px]">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[480px] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifikasi</span>
                        {unread > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium cursor-pointer">
                                Tandai dibaca semua
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {(list || []).length === 0 ? (
                            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">Tidak ada notifikasi</div>
                        ) : (
                            (list || []).map((n) => (
                                <button key={n.id} onClick={() => handleMarkRead(n.id)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!n.read_at ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5 text-base">{n.data.type === 'student_created' ? '➕' : n.data.type === 'student_updated' ? '✏️' : '🗑️'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.read_at ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{n.data.message}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ago(n.created_at)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                        {hasMore && (
                            <button onClick={() => fetchList(page + 1)}
                                className="w-full py-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium text-center cursor-pointer">
                                Muat lebih banyak
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
