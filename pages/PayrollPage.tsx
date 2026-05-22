
import React, { useState, useMemo } from 'react';
import { Employee } from '../data/employees';
import { Customer } from '../data/customers';
import { Page } from '../App';
import { formatDuration } from '../utils/timeUtils';
import { CheckCircleIcon, CurrencyEuroIcon } from '../components/icons';
import { EmployeeDocument } from '../data/documents';

// A small AlertTriangleIcon, so we don't have to modify the main icons file if it's not there
const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

interface PayrollPageProps {
    employees: Employee[];
    customers: Customer[];
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string, employeeId?: string) => void;
    onAddPayrollDocuments: (documents: EmployeeDocument[]) => void;
}

const PayrollPage: React.FC<PayrollPageProps> = ({ employees, customers, onNavigate, onAddPayrollDocuments }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const handleMonthChange = (offset: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoid issues with end of month
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const payrollData = useMemo(() => {
        return employees.map(employee => {
            const monthSessions = employee.workSessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate.getFullYear() === currentMonth.getFullYear() && sessionDate.getMonth() === currentMonth.getMonth();
            });

            const totalHoursMs = monthSessions.reduce((total, session) => {
                const finalBreak = session.adjustedBreakDurationMs ?? session.breakDurationMs;
                const workedTime = session.duration - finalBreak;
                return total + workedTime;
            }, 0);

            const hasAllData = !!employee.socialSecurityNumber &&
                               !!employee.healthInsurance &&
                               !!employee.healthInsuranceNumber &&
                               !!employee.iban &&
                               !!employee.bic;
            
            return {
                ...employee,
                totalHoursMs,
                hasAllData
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [employees, currentMonth]);

    const handleStartPayrollRun = async () => {
        const monthStr = currentMonth.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
        if (!window.confirm(`Möchten Sie den Abrechnungslauf für ${monthStr} starten? Es werden Lohnabrechnungen für alle Mitarbeiter mit vollständigen Stammdaten erstellt.`)) {
            return;
        }

        setIsLoading(true);
        const employeesToProcess = payrollData.filter(e => e.hasAllData);
        
        if (employeesToProcess.length === 0) {
            alert("Keine Mitarbeiter mit vollständigen Stammdaten gefunden. Es wurden keine Abrechnungen erstellt.");
            setIsLoading(false);
            return;
        }

        const newDocuments: EmployeeDocument[] = employeesToProcess.map(employee => {
            const workedTime = formatDuration(employee.totalHoursMs);
            // Dummy payslip HTML content
            const payslipHtml = `
                <h1>Lohnabrechnung</h1>
                <p><strong>Monat:</strong> ${monthStr}</p>
                <p><strong>Mitarbeiter:</strong> ${employee.name}</p>
                <hr>
                <h3>Stundenübersicht</h3>
                <p><strong>Geleistete Stunden:</strong> ${workedTime}</p>
                <br>
                <p><em>Dies ist eine automatisch generierte, vereinfachte Lohnabrechnung zu Demonstrationszwecken.</em></p>
            `;
            // Create a data URL from the HTML content
            const fileDataUrl = 'data:text/html;base64,' + btoa(unescape(encodeURIComponent(payslipHtml)));

            return {
                id: `doc_${Date.now()}_${employee.id}`,
                employeeId: employee.id,
                name: `Lohnabrechnung ${monthStr}`,
                fileDataUrl: fileDataUrl,
                uploadDate: new Date().toISOString().split('T')[0],
                category: 'payslip',
                isOpened: false,
                isDownloaded: false,
            };
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onAddPayrollDocuments(newDocuments);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
                    <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-3">
                        <CurrencyEuroIcon className="w-8 h-8"/>
                        Vorbereitung Lohnabrechnung
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&lt;</button>
                        <span className="font-semibold w-32 text-center">{currentMonth.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => handleMonthChange(1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">&gt;</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Mitarbeiter</th>
                                <th className="p-3 text-center">Geleistete Stunden</th>
                                <th className="p-3 text-center">Stammdaten</th>
                                <th className="p-3">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {payrollData.map(data => (
                                <tr key={data.id}>
                                    <td className="p-3 font-medium">{data.name}</td>
                                    <td className="p-3 text-center font-mono font-semibold">{formatDuration(data.totalHoursMs)}</td>
                                    <td className="p-3 text-center">
                                        {data.hasAllData ? 
                                            <span className="inline-flex items-center gap-1 text-green-600" title="Alle Daten vorhanden"><CheckCircleIcon className="w-5 h-5"/> Vollständig</span> :
                                            <span className="inline-flex items-center gap-1 text-amber-600" title="Stammdaten unvollständig"><AlertTriangleIcon className="w-5 h-5"/> Unvollständig</span>
                                        }
                                    </td>
                                    <td className="p-3">
                                        <button 
                                            onClick={() => onNavigate('employee-detail', undefined, undefined, undefined, data.id)}
                                            className="px-3 py-1 text-xs bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/50"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                     <button 
                        onClick={handleStartPayrollRun}
                        disabled={isLoading}
                        className="px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 disabled:bg-slate-400 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Wird verarbeitet...</span>
                            </>
                        ) : (
                            'Abrechnungslauf starten'
                        )}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default PayrollPage;
