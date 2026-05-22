
import React from 'react';
import { Page } from '../App';
import { Employee } from '../data/employees';
import { UsersIcon, UserPlusIcon } from '../components/icons';

interface EmployeesListProps {
    employees: Employee[];
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string, employeeId?: string) => void;
}

const EmployeesList: React.FC<EmployeesListProps> = ({ employees, onNavigate }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Mitarbeiterübersicht</h2>
                <button
                    onClick={() => onNavigate('employee-form')}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-300"
                >
                    <UserPlusIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">Neuer Mitarbeiter</span>
                </button>
            </div>
            <div className="space-y-4">
                {employees.map(employee => (
                    <button 
                        key={employee.id}
                        onClick={() => onNavigate('employee-detail', undefined, undefined, undefined, employee.id)}
                        className="w-full text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-500 transition-all duration-300 flex items-center gap-4"
                    >
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-500">
                             <UsersIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-sky-800 dark:text-sky-300">{employee.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{employee.username}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmployeesList;
