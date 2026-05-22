import React, { useState } from 'react';
import { NewCustomerData } from '../App';
import { UserPlusIcon } from '../components/icons';

interface CustomerFormProps {
    onAddCustomer: (customer: NewCustomerData) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onAddCustomer, onCancel }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [position, setPosition] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [street, setStreet] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');
    const [propertySize, setPropertySize] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericPropertySize = parseFloat(propertySize) || 0;
        const numericHourlyRate = parseFloat(hourlyRate) || 0;

        if (!name || !contactPerson) {
            alert("Bitte füllen Sie mindestens den Firmennamen und den Ansprechpartner aus.");
            return;
        }

        onAddCustomer({
            name,
            contactPerson,
            position,
            phone,
            email,
            password,
            address: { street, zipCode, city },
            propertySize: numericPropertySize,
            hourlyRate: numericHourlyRate,
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
                className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Neuen Kunden anlegen</h2>

            {/* General Information */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Allgemeine Informationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("Firma / Name", name, (e) => setName(e.target.value), 'text', true, 'z.B. Mustermann GmbH')}
                    {renderInputField("Ansprechpartner", contactPerson, (e) => setContactPerson(e.target.value), 'text', true, 'z.B. Max Mustermann')}
                    {renderInputField("Position", position, (e) => setPosition(e.target.value), 'text', false, 'z.B. Geschäftsführer')}
                </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Kontaktdaten & Zugang</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("E-Mail (Login)", email, (e) => setEmail(e.target.value), 'email', false, 'max.mustermann@firma.de')}
                    {renderInputField("Passwort für Kundenportal", password, (e) => setPassword(e.target.value), 'password', false, 'Sicheres Passwort wählen')}
                    {renderInputField("Telefon", phone, (e) => setPhone(e.target.value), 'tel', false, '0123-456789')}
                </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Anschrift</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        {renderInputField("Straße & Hausnummer", street, (e) => setStreet(e.target.value))}
                    </div>
                    {renderInputField("PLZ", zipCode, (e) => setZipCode(e.target.value))}
                    <div className="md:col-span-3">
                         {renderInputField("Stadt", city, (e) => setCity(e.target.value))}
                    </div>
                </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Konditionen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("Objektgröße (m²)", propertySize, (e) => setPropertySize(e.target.value), 'number', false, 'z.B. 250')}
                    {renderInputField("Stundensatz (€)", hourlyRate, (e) => setHourlyRate(e.target.value), 'number', false, 'z.B. 55.00')}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">Abbrechen</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300">
                    <UserPlusIcon className="w-5 h-5"/>
                    Kunden speichern
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;