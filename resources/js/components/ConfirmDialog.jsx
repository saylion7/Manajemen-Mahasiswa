const ConfirmDialog = ({ isOpen, title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title || 'Konfirmasi'}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{message || 'Yakin ingin melanjutkan?'}</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 cursor-pointer"
                    >Batal</button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer disabled:opacity-50 ${
                            confirmClass || 'bg-red-600 hover:bg-red-700'
                        }`}
                    >{loading ? 'Memproses...' : confirmLabel || 'Hapus'}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
