import React from 'react';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    isUrgent?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, onClick, isUrgent = false }) => {
    
    const urgentClasses = isUrgent 
        ? "border-red-500 dark:border-red-500 shadow-red-500/20 animate-pulse hover:border-red-600 dark:hover:border-red-600"
        : "border-slate-200 dark:border-slate-700/50 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-amber-500/10";
    
    return (
        <button 
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border text-left transition-all duration-300 group ${urgentClasses}`}
        >
            <div className={`${isUrgent ? 'text-red-500' : 'text-amber-500'} mb-3`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-sky-800 dark:text-sky-300 mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </button>
    );
};