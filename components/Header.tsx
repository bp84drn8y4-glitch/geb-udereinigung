import { useState } from 'react';
import fuerstHauserLogo from '../assets/logos/fuerst-hauser-logo.png';   // ← Add this line

// ... rest of your imports

const Header = ({ onNavigate, logoUrl, onLogout, onSaveState }) => {
    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                
                {/* Updated Logo */}
                <div className="flex items-center gap-3">
                    <img 
                        src={fuerstHauserLogo} 
                        alt="Fürst Hauser Gebäudereinigung" 
                        className="h-11 w-auto object-contain" 
                    />
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Fürst Hauser</h1>
                        <p className="text-xs text-slate-500 -mt-1">Gebäudereinigung</p>
                    </div>
                </div>

                {/* Navigation buttons... */}
                {/* Keep the rest of your header code the same */}
            </div>
        </header>
    );
};

export default Header;