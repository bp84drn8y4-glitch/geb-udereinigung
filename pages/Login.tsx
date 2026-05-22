import React, { useState, useRef } from 'react';
import { Employee } from '../data/employees';
import { Customer } from '../data/customers';
import { loadStateFromFile } from '../utils/saveLoad';
import { UploadIcon } from '../components/icons';

interface LoginProps {
    employees: Employee[];
    customers: Customer[];
    onAdminLogin: () => void;
    onEmployeeLogin: (employee: Employee) => void;
    onCustomerLogin: (customer: Customer) => void;
    onLoadState: (state: any) => void;
    logoUrl: string;
}

const Login: React.FC<LoginProps> = ({ employees, customers, onAdminLogin, onEmployeeLogin, onCustomerLogin, onLoadState, logoUrl }) => {
    const [loginType, setLoginType] = useState<'admin' | 'employee' | 'customer'>('employee');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (loginType === 'admin') {
            if (username === 'admin' && password === 'admin') {
                onAdminLogin();
            } else {
                setError('Ungültige Admin-Anmeldedaten.');
            }
        } else if (loginType === 'employee') {
            const employee = employees.find(
                (emp) => emp.username === username && emp.password === password
            );
            if (employee) {
                onEmployeeLogin(employee);
            } else {
                setError('Ungültiger Benutzername oder Passwort.');
            }
        } else if (loginType === 'customer') {
            const customer = customers.find(
                (cust) => cust.email.toLowerCase() === username.toLowerCase() && cust.password === password
            );
            if (customer) {
                onCustomerLogin(customer);
            } else {
                setError('Ungültige E-Mail oder Passwort.');
            }
        }
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const loadedState = await loadStateFromFile(file);
                onLoadState(loadedState);
                alert("Daten erfolgreich geladen!");
            } catch (err: any) {
                alert(`Fehler beim Laden der Datei: ${err.message}`);
                console.error(err);
            } finally {
                // Reset file input to allow loading the same file again
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };


    const renderForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                    {loginType === 'customer' ? 'E-Mail' : 'Benutzername'}
                </label>
                <input
                    type={loginType === 'customer' ? 'email' : 'text'}
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </div>
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                    Passwort
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
            <div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300"
                >
                    Anmelden
                </button>
            </div>
        </form>
    );
    
    const getButtonClasses = (type: 'admin' | 'employee' | 'customer') => {
        return `shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
            loginType === type
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
        }`;
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
            <div className="w-full max-w-2xl">
                <img src={logoUrl} alt="Logo" className="w-full h-auto mx-auto" />
            </div>
            <div className="w-full max-w-md">
                 <div className="w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                    <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex gap-6" aria-label="Tabs">
                            <button onClick={() => { setLoginType('employee'); setError(''); setUsername(''); }} className={getButtonClasses('employee')}>
                                Mitarbeiter
                            </button>
                             <button onClick={() => { setLoginType('customer'); setError(''); setUsername(''); }} className={getButtonClasses('customer')}>
                                Kunde
                            </button>
                            <button onClick={() => { setLoginType('admin'); setError(''); setUsername(''); }} className={getButtonClasses('admin')}>
                                Administrator
                            </button>
                        </nav>
                    </div>
                    {renderForm()}
                </div>
                 <div className="mt-6 text-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".fhg" style={{ display: 'none' }} />
                    <button
                        type="button"
                        onClick={handleLoadClick}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <UploadIcon className="w-5 h-5"/>
                        Daten laden
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default Login;
