import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:min-w-[320px] sm:max-w-[400px]">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
                            t.type === 'success'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                        }`}
                    >
                        <span>{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="font-bold leading-none hover:opacity-70 cursor-pointer shrink-0"
                        >&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
