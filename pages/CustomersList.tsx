import React, { useMemo } from 'react';
import { Page } from '../App';
import { Customer } from '../data/customers';
import { AcceptanceProtocol } from '../data/acceptanceProtocols';
import { UsersIcon, UserPlusIcon } from '../components/icons';

interface CustomersListProps {
    customers: Customer[];
    protocols: AcceptanceProtocol[];
    onNavigate: (page: Page, customerId?: string) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({ customers, protocols, onNavigate }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Kundenübersicht</h2>
                <button
                    onClick={() => onNavigate('customer-form')}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-300"
                >
                    <UserPlusIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">Neuer Kunde</span>
                </button>
            </div>
            <div className="space-y-4">
                {customers.map(customer => {
                    const hasUrgentRequest = useMemo(() => 
                        protocols.some(p => p.customerId === customer.id && p.qualityFeedback?.requestSupervisor), 
                    [protocols, customer.id]);

                    return (
                        <button 
                            key={customer.id}
                            onClick={() => onNavigate('customer-detail', customer.id)}
                            className={`w-full text-left p-4 rounded-lg border hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-500 transition-all duration-300 flex items-center gap-4 relative
                                ${hasUrgentRequest 
                                    ? 'bg-red-50 dark:bg-red-900/30 border-red-500/50 dark:border-red-500/50 ring-2 ring-red-500/30 animate-pulse' 
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${hasUrgentRequest ? 'bg-red-100 dark:bg-red-900/50 text-red-500' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-500'}`}>
                                 <UsersIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-sky-800 dark:text-sky-300">{customer.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{customer.contactPerson} ({customer.position})</p>
                            </div>
                            {hasUrgentRequest && <span className="absolute top-2 right-2 text-xs font-bold text-red-600 dark:text-red-300">DRINGEND</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default CustomersList;