import React, { useState, useMemo } from 'react';
import { DownloadIcon } from './icons';

interface HistoryListProps<T extends { id: string; date: string }> {
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    searchKeys: (keyof T)[];
    icon?: React.ReactNode;
    onExport?: (filteredItems: T[]) => void;
    exportButtonLabel?: string;
}

const HistoryList = <T extends { id: string; date: string }>({ title, items, renderItem, searchKeys, icon, onExport, exportButtonLabel }: HistoryListProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearchTerm = searchTerm.toLowerCase() === '' || 
                searchKeys.some(key => {
                    const value = item[key];
                    if (Array.isArray(value)) {
                        return value.some(v => {
                            if (typeof v === 'object' && v !== null) {
                                return Object.values(v).join(' ').toLowerCase().includes(searchTerm.toLowerCase());
                            }
                            return String(v).toLowerCase().includes(searchTerm.toLowerCase());
                        });
                    }
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });

            const matchesDate = searchDate === '' || item.date.startsWith(searchDate);

            return matchesSearchTerm && matchesDate;
        });
    }, [items, searchTerm, searchDate, searchKeys]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center text-sky-800 dark:text-sky-300">{icon}{title}</h3>
                {onExport && exportButtonLabel && (
                    <button 
                        onClick={() => onExport && onExport(filteredItems)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-700 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-800 transition-colors"
                        aria-label={exportButtonLabel}
                    >
                        <DownloadIcon className="w-4 h-4"/>
                        {exportButtonLabel}
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Stichwortsuche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                />
                <div className="relative">
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                         className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    />
                     {searchDate && (
                        <button onClick={() => setSearchDate('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-lg leading-none">
                           &times;
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div key={item.id}>{renderItem(item)}</div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">Keine Einträge gefunden.</p>
                )}
            </div>
        </div>
    );
};

export default HistoryList;