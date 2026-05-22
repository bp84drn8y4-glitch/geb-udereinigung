import React from 'react';
import { Page } from '../App';
import { logoDataUrl } from '../assets/logo';
import { LogoutIcon, FloppyDiskIcon } from './icons';

interface HeaderProps {
    onNavigate: (page: Page) => void;
    logoUrl: string;
    onLogout: () => void;
    onSaveState: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, logoUrl, onLogout, onSaveState }) => {
    return (
        <header className="w-full py-3 px-6 bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <button onClick={() => onNavigate('dashboard')} aria-label="Zum Dashboard">
                    <img src={logoUrl} alt="First Hauser Logo" className="h-16" />
                </button>
                <div className="flex items-center gap-4">
                     <button
                        onClick={onSaveState}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
                        aria-label="Daten speichern"
                    >
                        <FloppyDiskIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Speichern</span>
                    </button>
                     <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Abmelden"
                    >
                        <LogoutIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Abmelden</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
