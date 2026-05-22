import React, { useState, useEffect } from 'react';
import { Employee } from '../data/employees';
import { Customer } from '../data/customers';
import { ActiveWorkSession, Page } from '../App';
import { ClockIcon, CubeIcon, DocumentTextIcon, EnvelopeIcon, DocumentArrowDownIcon } from '../components/icons';

interface EmployeeDashboardProps {
    employee: Employee;
    assignedCustomers: Customer[];
    customers: Customer[];
    activeSession: ActiveWorkSession | null;
    onStartWork: (customerId: string) => void;
    onEndWork: () => void;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
    unreadMessagesCount: number;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
    employee,
    assignedCustomers,
    customers,
    activeSession,
    onStartWork,
    onEndWork,
    onLogout,
    onNavigate,
    unreadMessagesCount
}) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [showCustomerSelect, setShowCustomerSelect] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (activeSession) {
            const timer = setInterval(() => {
                setElapsedTime(Date.now() - activeSession.startTime);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeSession]);

    const handleStartWorkClick = () => {
        if (assignedCustomers.length === 1) {
            onStartWork(assignedCustomers[0].id);
        } else {
            setShowCustomerSelect(true);
        }
    };
    
    const handleCustomerSelectAndStart = () => {
        if (selectedCustomerId) {
            onStartWork(selectedCustomerId);
            setShowCustomerSelect(false);
        } else {
            alert("Bitte wählen Sie einen Kunden aus.");
        }
    };

    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const activeCustomerName = activeSession ? customers.find(c => c.id === activeSession.customerId)?.name : '';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">Willkommen, {employee.name}!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Hier können Sie Ihre Arbeitszeit erfassen und Material bestellen.</p>
                </div>
            </div>

            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                {!activeSession && !showCustomerSelect && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Bereit für die Arbeit?</h3>
                        <p className="text-slate-500">Klicken Sie hier, um Ihre Arbeitszeit zu starten.</p>
                        <button
                            onClick={handleStartWorkClick}
                            disabled={!!activeSession}
                            className="px-8 py-4 bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Arbeit beginnen
                        </button>
                    </div>
                )}

                {showCustomerSelect && (
                     <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-xl font-semibold">Für welchen Kunden arbeiten Sie?</h3>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"
                        >
                            <option value="">Bitte auswählen...</option>
                            {assignedCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="flex gap-4">
                             <button
                                onClick={() => setShowCustomerSelect(false)}
                                className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleCustomerSelectAndStart}
                                disabled={!selectedCustomerId}
                                className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-lg disabled:bg-slate-400"
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                )}
                
                {activeSession && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-500 animate-pulse">
                            <ClockIcon className="w-6 h-6" />
                            <h3 className="text-xl font-semibold">Arbeitszeit läuft</h3>
                        </div>
                        <p className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100">{formatDuration(elapsedTime)}</p>
                        <p className="text-slate-500">Kunde: <span className="font-semibold">{activeCustomerName}</span></p>
                        <button
                            onClick={onEndWork}
                            className="px-8 py-4 bg-red-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105"
                        >
                            Arbeit beenden
                        </button>
                    </div>
                )}

            </div>

             <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => onNavigate('messages')}
                        disabled={!!activeSession}
                        className="relative w-full text-center py-3 px-4 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EnvelopeIcon className="w-5 h-5"/>
                        Meine Nachrichten
                        {unreadMessagesCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {unreadMessagesCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => onNavigate('documents')}
                        disabled={!!activeSession}
                        className="w-full text-center py-3 px-4 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5"/>
                        Meine Dokumente
                    </button>
                    <button 
                        onClick={() => onNavigate('material-order')}
                        disabled={!!activeSession}
                        className="w-full text-center py-3 px-4 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CubeIcon className="w-5 h-5"/>
                        Material
                    </button>
                    <button 
                        onClick={() => onNavigate('timesheet')}
                        disabled={!!activeSession}
                        className="w-full text-center py-3 px-4 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DocumentTextIcon className="w-5 h-5"/>
                        Stundenliste
                    </button>
                </div>
        </div>
    );
};

export default EmployeeDashboard;
