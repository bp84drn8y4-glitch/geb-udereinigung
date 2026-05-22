
import React, { useMemo } from 'react';
import { Page } from '../App';
import { DashboardCard } from '../components/DashboardCard';
import { UsersIcon, MegaphoneIcon, CogIcon, ChartPieIcon, CurrencyEuroIcon } from '../components/icons';
import { AcceptanceProtocol } from '../data/acceptanceProtocols';
import { Invoice } from '../data/invoices';
import { Customer } from '../data/customers';
import PerformanceDonutChart from '../components/PerformanceDonutChart';

interface DashboardProps {
    onNavigate: (page: Page) => void;
    protocols: AcceptanceProtocol[];
    invoices: Invoice[];
    customers: Customer[];
    userType: 'admin' | 'employee' | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, protocols, customers, userType }) => {
    
    const hasUrgentFeedback = useMemo(() => 
        protocols.some(p => p.qualityFeedback?.requestSupervisor),
    [protocols]);

    const performanceData = useMemo(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const customerPerformances = customers
            .map(customer => {
                const targetHours = (customer.monthlyTarget || [])
                    .filter(t => t.unit === 'hours')
                    .reduce((sum, t) => sum + t.value, 0);

                if (targetHours === 0) {
                    return null;
                }

                const actualMs = protocols
                    .filter(p => {
                        const protocolDate = new Date(p.date);
                        return p.customerId === customer.id &&
                               protocolDate.getFullYear() === currentYear &&
                               protocolDate.getMonth() === currentMonth;
                    })
                    .reduce((sum, p) => sum + p.durationMs, 0);
                
                const actualHours = actualMs / (1000 * 60 * 60);
                const percentage = (actualHours / targetHours) * 100;

                return {
                    customerId: customer.id,
                    customerName: customer.name,
                    targetHours,
                    actualHours,
                    percentage,
                };
            })
            .filter(Boolean) as { customerId: string; customerName: string; targetHours: number; actualHours: number; percentage: number; }[];

        const totalTargetHours = customerPerformances.reduce((sum, data) => sum + data.targetHours, 0);
        const totalActualHours = customerPerformances.reduce((sum, data) => sum + data.actualHours, 0);
        const totalPercentage = totalTargetHours > 0 ? (totalActualHours / totalTargetHours) * 100 : 0;

        return {
            customerPerformances,
            totalTargetHours,
            totalActualHours,
            totalPercentage,
        };
    }, [customers, protocols]);
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-sky-800 dark:text-sky-300">Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     <DashboardCard 
                        title="Kunden"
                        description="Kundeninformationen, Historie und Rechnungen verwalten."
                        icon={<UsersIcon className="w-8 h-8"/>}
                        onClick={() => onNavigate('customers-list')}
                    />
                    <DashboardCard 
                        title="Neukundenaquise"
                        description="Interessenten verwalten und neue Kunden gewinnen."
                        icon={<MegaphoneIcon className="w-8 h-8"/>}
                        onClick={() => onNavigate('acquisition')}
                    />
                     <DashboardCard 
                        title="Mitarbeiter"
                        description="Mitarbeiter verwalten und Arbeitszeiten einsehen."
                        icon={<UsersIcon className="w-8 h-8"/>}
                        onClick={() => onNavigate('employees-list')}
                    />
                    {userType === 'admin' && (
                        <DashboardCard 
                            title="Lohnabrechnung"
                            description="Arbeitsstunden prüfen und Lohnabrechnungen vorbereiten."
                            icon={<CurrencyEuroIcon className="w-8 h-8"/>}
                            onClick={() => onNavigate('payroll')}
                        />
                     )}
                    {userType === 'admin' && (
                        <DashboardCard 
                            title="Qualität"
                            description="Kundenfeedback auswerten und auf Anfragen reagieren."
                            icon={<ChartPieIcon className="w-8 h-8"/>}
                            onClick={() => onNavigate('quality')}
                            isUrgent={hasUrgentFeedback}
                        />
                     )}
                     {userType === 'admin' && (
                        <DashboardCard 
                            title="Einstellungen"
                            description="Logo hochladen und Mitarbeiterberechtigungen verwalten."
                            icon={<CogIcon className="w-8 h-8"/>}
                            onClick={() => onNavigate('settings')}
                        />
                     )}
                </div>
            </div>

            {/* Performance Charts Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                 <h2 className="text-2xl font-semibold mb-6 text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Leistungsübersicht (Aktueller Monat)</h2>
                 
                 {performanceData.totalTargetHours > 0 ? (
                    <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center items-start mt-4">
                        {/* Total Performance Chart */}
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <PerformanceDonutChart 
                                percentage={performanceData.totalPercentage}
                                size={120}
                                strokeWidth={12}
                                label="Gesamtleistung"
                                valueText={`${performanceData.totalActualHours.toFixed(1)} / ${performanceData.totalTargetHours.toFixed(1)} h`}
                            />
                        </div>

                        {/* Customer Performance Charts */}
                        {performanceData.customerPerformances.map(data => (
                            <div key={data.customerId} className="flex flex-col items-center">
                                <PerformanceDonutChart 
                                    percentage={data.percentage}
                                    size={90}
                                    strokeWidth={9}
                                    label={data.customerName}
                                    valueText={`${data.actualHours.toFixed(1)} / ${data.targetHours.toFixed(1)} h`}
                                />
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500 dark:text-slate-400">Für den aktuellen Monat sind keine Soll-Stunden für Kunden hinterlegt.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Dashboard;
