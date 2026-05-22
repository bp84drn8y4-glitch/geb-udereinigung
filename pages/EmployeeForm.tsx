
import React, { useState, useEffect } from 'react';
import { NewEmployeeData } from '../App';
import { UserPlusIcon } from '../components/icons';
import { jobFunctions } from '../data/jobFunctions';

interface EmployeeFormProps {
    onAddEmployee: (employee: NewEmployeeData) => void;
    onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onAddEmployee, onCancel }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [jobFunction, setJobFunction] = useState('');
    const [customJobFunction, setCustomJobFunction] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    useEffect(() => {
        if (jobFunction && jobFunction !== 'Sonstiges') {
            const selectedFunc = jobFunctions.find(f => f.name === jobFunction);
            if (selectedFunc) {
                setHourlyRate(selectedFunc.rate.toString());
            }
        } else if (jobFunction === 'Sonstiges') {
            setHourlyRate('');
        }
    }, [jobFunction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalJobFunction = jobFunction === 'Sonstiges' ? customJobFunction : jobFunction;
        const numericHourlyRate = parseFloat(hourlyRate);

        if (!name || !username || !password || !finalJobFunction || isNaN(numericHourlyRate)) {
            alert("Bitte füllen Sie alle erforderlichen Felder aus.");
            return;
        }

        onAddEmployee({
            name,
            username,
            password,
            jobFunction: finalJobFunction,
            hourlyRate: numericHourlyRate,
            assignedCustomerIds: [],
            permissions: ['employee-dashboard', 'acceptance-form', 'material-order', 'timesheet'],
        });
    };

    const renderInputField = (
        label: string, 
        value: string, 
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
        type = 'text',
        required = false,
        placeholder = ''
    ) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}{required && '*'}</label>
            <input 
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-300"
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Neuen Mitarbeiter anlegen</h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("Vollständiger Name", name, (e) => setName(e.target.value), 'text', true, 'z.B. Max Mustermann')}
                    {renderInputField("Benutzername", username, (e) => setUsername(e.target.value), 'text', true, 'z.B. mmustermann')}
                    {renderInputField("Passwort", password, (e) => setPassword(e.target.value), 'password', true, 'Passwort vergeben')}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funktion*</label>
                        <select
                            value={jobFunction}
                            onChange={(e) => setJobFunction(e.target.value)}
                            required
                            className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Bitte auswählen...</option>
                            {jobFunctions.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                    
                    {jobFunction === 'Sonstiges' &&
                        renderInputField("Funktion (benutzerdefiniert)", customJobFunction, (e) => setCustomJobFunction(e.target.value), 'text', true)
                    }

                    {renderInputField("Stundenlohn (€)*", hourlyRate, (e) => setHourlyRate(e.target.value), 'number', true, 'z.B. 15.50')}

                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">Abbrechen</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300">
                    <UserPlusIcon className="w-5 h-5"/>
                    Mitarbeiter speichern
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;
