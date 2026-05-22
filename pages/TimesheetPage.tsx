import React, { useState, useMemo } from 'react';
import { Employee, WorkSession, Location } from '../data/employees';
import { Customer } from '../data/customers';
import { WorkSessionUpdateData } from '../App';
import { formatDuration } from '../utils/timeUtils';
import { EditIcon, CheckCircleIcon, XCircleIcon, MapPinIcon, MapPinSlashIcon } from '../components/icons';

interface TimesheetPageProps {
    employees: Employee[];
    customers: Customer[];
    viewingEmployeeId: string | null;
    loggedInUser: Employee | { id: string };
    userType: 'admin' | 'employee';
    onUpdateWorkSession: (employeeId: string, sessionId: string, data: WorkSessionUpdateData) => void;
}

const TimesheetPage: React.FC<TimesheetPageProps> = ({ employees, customers, viewingEmployeeId, loggedInUser, userType, onUpdateWorkSession }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [adminSelectedEmployeeId, setAdminSelectedEmployeeId] = useState<string | null>(viewingEmployeeId);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

    // State for edited values
    const [editedStartTime, setEditedStartTime] = useState('');
    const [editedEndTime, setEditedEndTime] = useState('');
    const [editedBreak, setEditedBreak] = useState('');

    const openMap = (location: Location | undefined) => {
        if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
            window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank', 'noopener,noreferrer');
        }
    };

    const employeeToView = useMemo(() => {
        const id = userType === 'admin' ? adminSelectedEmployeeId : loggedInUser.id;
        return employees.find(e => e.id === id);
    }, [employees, adminSelectedEmployeeId, loggedInUser.id, userType]);

    const monthSessions = useMemo(() => {
        if (!employeeToView) return [];
        return employeeToView.workSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate.getFullYear() === currentDate.getFullYear() && sessionDate.getMonth() === currentDate.getMonth();
        }).sort((a, b) => b.startTime - a.startTime);
    }, [employeeToView, currentDate]);
    
    const totalHours = useMemo(() => {
        return monthSessions.reduce((total, session) => {
            const finalBreak = session.adjustedBreakDurationMs ?? session.breakDurationMs;
            const workedTime = session.duration - finalBreak;
            return total + workedTime;
        }, 0);
    }, [monthSessions]);

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleStartEdit = (session: WorkSession) => {
        setEditingSessionId(session.id);
        const finalBreakMinutes = (session.adjustedBreakDurationMs ?? session.breakDurationMs) / (60 * 1000);
        setEditedBreak(String(finalBreakMinutes));
        setEditedStartTime(new Date(session.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
        setEditedEndTime(new Date(session.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    };

    const handleCancelEdit = () => {
        setEditingSessionId(null);
    };

    const handleSaveEdit = (session: WorkSession) => {
        if (!employeeToView) return;

        const breakMs = Math.max(0, Number(editedBreak) * 60 * 1000);
        const updateData: WorkSessionUpdateData = { adjustedBreakDurationMs: breakMs };

        if (userType === 'admin') {
            try {
                const originalDate = new Date(session.startTime);
                const [startHours, startMinutes] = editedStartTime.split(':').map(Number);
                const [endHours, endMinutes] = editedEndTime.split(':').map(Number);

                if(isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) throw new Error("Ungültiges Zeitformat");

                const newStartDate = new Date(originalDate.getFullYear(), originalDate.getMonth(), originalDate.getDate(), startHours, startMinutes);
                
                const newEndDate = new Date(originalDate.getFullYear(), originalDate.getMonth(), originalDate.getDate(), endHours, endMinutes);
                if(newEndDate < newStartDate) { // Assuming overnight work goes to next day
                    newEndDate.setDate(newEndDate.getDate() + 1);
                }

                updateData.startTime = newStartDate.getTime();
                updateData.endTime = newEndDate.getTime();
            } catch(e) {
                alert("Fehler im Zeitformat. Bitte HH:MM verwenden.");
                return;
            }
        }
        
        onUpdateWorkSession(employeeToView.id, session.id, updateData);
        setEditingSessionId(null);
    };

    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Unbekannt";

    if (!employeeToView) {
        return <div className="text-center p-8">Bitte wählen Sie einen Mitarbeiter aus.</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Stundenliste für {employeeToView.name}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&lt;</button>
                    <span className="font-semibold w-32 text-center">{currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => handleMonthChange(1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&gt;</button>
                </div>
            </div>
            {userType === 'admin' && (
                <div className="mb-4">
                    <label htmlFor="employee-select" className="text-sm font-medium">Mitarbeiter anzeigen: </label>
                    <select id="employee-select" value={adminSelectedEmployeeId || ''} onChange={e => setAdminSelectedEmployeeId(e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Datum</th>
                            <th className="p-3">Kunde</th>
                            <th className="p-3">Beginn</th>
                            <th className="p-3">Ende</th>
                            <th className="p-3 text-center">Gesamtzeit</th>
                            <th className="p-3 text-center">Pause (Min)</th>
                            <th className="p-3 text-center font-bold">Arbeitszeit</th>
                            <th className="p-3 text-center">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {monthSessions.map(session => {
                            const isEditing = editingSessionId === session.id;
                            const finalBreak = session.adjustedBreakDurationMs ?? session.breakDurationMs;
                            const workedTime = session.duration - finalBreak;

                            if(isEditing) {
                                return (
                                     <tr key={session.id} className="bg-amber-50 dark:bg-amber-900/20">
                                        <td className="p-3">{new Date(session.startTime).toLocaleDateString('de-DE')}</td>
                                        <td className="p-3">{getCustomerName(session.customerId)}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {userType === 'admin' ? 
                                                    <input type="time" value={editedStartTime} onChange={e => setEditedStartTime(e.target.value)} className="w-24 p-1 bg-white dark:bg-slate-800 rounded-md border-slate-300 dark:border-slate-600"/> :
                                                    new Date(session.startTime).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})
                                                }
                                                {userType === 'admin' && ( session.startLocation ?
                                                    <button type="button" onClick={() => openMap(session.startLocation)} title="Start-Position auf Karte anzeigen" className="p-0 bg-transparent border-none cursor-pointer"><MapPinIcon className="w-4 h-4 text-sky-600 hover:text-sky-800" /></button> :
                                                    <span title="Start-Position nicht erfasst"><MapPinSlashIcon className="w-4 h-4 text-slate-400" /></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {userType === 'admin' ? 
                                                    <input type="time" value={editedEndTime} onChange={e => setEditedEndTime(e.target.value)} className="w-24 p-1 bg-white dark:bg-slate-800 rounded-md border-slate-300 dark:border-slate-600"/> :
                                                    new Date(session.endTime).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})
                                                }
                                                {userType === 'admin' && ( session.endLocation ?
                                                    <button type="button" onClick={() => openMap(session.endLocation)} title="End-Position auf Karte anzeigen" className="p-0 bg-transparent border-none cursor-pointer"><MapPinIcon className="w-4 h-4 text-sky-600 hover:text-sky-800" /></button> :
                                                    <span title="End-Position nicht erfasst"><MapPinSlashIcon className="w-4 h-4 text-slate-400" /></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">{formatDuration(session.duration)}</td>
                                        <td className="p-3 text-center">
                                            <input type="number" value={editedBreak} onChange={e => setEditedBreak(e.target.value)} className="w-16 p-1 text-center bg-white dark:bg-slate-800 rounded-md border-slate-300 dark:border-slate-600"/>
                                        </td>
                                        <td className="p-3 text-center font-bold">--</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleSaveEdit(session)} className="text-green-600 hover:text-green-800"><CheckCircleIcon className="w-5 h-5"/></button>
                                                <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800"><XCircleIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }
                            return (
                                <tr key={session.id}>
                                    <td className="p-3">{new Date(session.startTime).toLocaleDateString('de-DE')}</td>
                                    <td className="p-3">{getCustomerName(session.customerId)}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {new Date(session.startTime).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}
                                            {userType === 'admin' && ( session.startLocation ?
                                                <button type="button" onClick={() => openMap(session.startLocation)} title="Start-Position auf Karte anzeigen" className="p-0 bg-transparent border-none cursor-pointer">
                                                    <MapPinIcon className="w-4 h-4 text-sky-600 hover:text-sky-800" />
                                                </button> :
                                                <span title="Start-Position nicht erfasst">
                                                    <MapPinSlashIcon className="w-4 h-4 text-slate-400" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {new Date(session.endTime).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}
                                            {userType === 'admin' && ( session.endLocation ?
                                                <button type="button" onClick={() => openMap(session.endLocation)} title="End-Position auf Karte anzeigen" className="p-0 bg-transparent border-none cursor-pointer">
                                                    <MapPinIcon className="w-4 h-4 text-sky-600 hover:text-sky-800" />
                                                </button> :
                                                <span title="End-Position nicht erfasst">
                                                    <MapPinSlashIcon className="w-4 h-4 text-slate-400" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">{formatDuration(session.duration)}</td>
                                    <td className="p-3 text-center">{finalBreak / (60 * 1000)}</td>
                                    <td className="p-3 text-center font-bold">{formatDuration(workedTime)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleStartEdit(session)} className="text-slate-500 hover:text-sky-600"><EditIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                <p className="text-slate-600 dark:text-slate-400">Geleistete Arbeitsstunden diesen Monat:</p>
                <p className="text-2xl font-bold text-sky-800 dark:text-sky-300">{formatDuration(totalHours)}</p>
            </div>
        </div>
    );
};

export default TimesheetPage;