
import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../data/employees';
import { Customer } from '../data/customers';
import { Page } from '../App';
import { EditIcon, DocumentTextIcon, EnvelopeIcon, DocumentArrowDownIcon, TrashIcon, UploadIcon } from '../components/icons';
import { MaterialOrder } from '../data/materialOrders';
import { Message } from '../data/messages';
import { EmployeeDocument } from '../data/documents';
import HistoryList from '../components/HistoryList';
import { jobFunctions } from '../data/jobFunctions';
import { openDocument } from '../utils/pdfUtils';

interface EmployeeDetailProps {
    employee: Employee;
    customers: Customer[];
    materialOrders: MaterialOrder[];
    messages: Message[];
    documents: EmployeeDocument[];
    onUpdateEmployee: (employee: Employee) => void;
    onDeleteEmployee: (employeeId: string) => void;
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string, employeeId?: string) => void;
    onSendMessage: (employeeId: string, content: string) => void;
    onAddDocument: (employeeId: string, name: string, fileDataUrl: string, category: EmployeeDocument['category']) => void;
    onDeleteDocument: (documentId: string) => void;
    onDocumentViewed: (documentId: string) => void;
}

const confessionMap: Record<NonNullable<Employee['confession']>, string> = {
    RK: 'Römisch-katholisch',
    EV: 'Evangelisch',
    none: 'Ohne Konfession',
};

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ 
    employee, customers, materialOrders, messages, documents, 
    onUpdateEmployee, onDeleteEmployee, onNavigate, onSendMessage, onAddDocument, onDeleteDocument, onDocumentViewed
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState<Employee>(employee);
    const [customJobFunction, setCustomJobFunction] = useState('');

    const [newMessage, setNewMessage] = useState('');
    const [docName, setDocName] = useState('');
    const [docFile, setDocFile] = useState<string | null>(null);
    const [docFileName, setDocFileName] = useState('');
    const [docCategory, setDocCategory] = useState<EmployeeDocument['category']>('other');
    const docFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedEmployee(employee);
        const isCustom = employee.jobFunction && !jobFunctions.some(f => f.name === employee.jobFunction);
        if (isCustom) {
            setCustomJobFunction(employee.jobFunction || '');
        } else {
            setCustomJobFunction('');
        }
    }, [employee]);

    useEffect(() => {
        if (!isEditing) return;

        const selectedFunc = jobFunctions.find(f => f.name === editedEmployee.jobFunction);
        if (selectedFunc && selectedFunc.name !== 'Sonstiges') {
            setEditedEmployee(prev => ({
                ...prev,
                hourlyRate: selectedFunc.rate,
            }));
        }
    }, [editedEmployee.jobFunction, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? undefined : parseFloat(value);
        setEditedEmployee(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleCustomerAssignmentChange = (customerId: string) => {
        setEditedEmployee(prev => {
            const assignedCustomerIds = prev.assignedCustomerIds.includes(customerId)
                ? prev.assignedCustomerIds.filter(id => id !== customerId)
                : [...prev.assignedCustomerIds, customerId];
            return { ...prev, assignedCustomerIds };
        });
    };

    const handleSave = () => {
        const finalEmployeeData = { ...editedEmployee };
        if (editedEmployee.jobFunction === 'Sonstiges' && customJobFunction) {
            finalEmployeeData.jobFunction = customJobFunction;
        }
        onUpdateEmployee(finalEmployeeData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedEmployee(employee);
        setIsEditing(false);
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            onSendMessage(employee.id, newMessage.trim());
            setNewMessage('');
        }
    };
    
    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDocFile(event.target?.result as string);
                setDocFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDocument = () => {
        if (!docName.trim() || !docFile) {
            alert("Bitte Dokumentenname und Datei angeben.");
            return;
        }
        onAddDocument(employee.id, docName.trim(), docFile, docCategory);
        setDocName('');
        setDocFile(null);
        setDocFileName('');
        setDocCategory('other');
        if (docFileInputRef.current) {
            docFileInputRef.current.value = '';
        }
    };

    const handleOpenDocument = (doc: EmployeeDocument) => {
        openDocument(doc.fileDataUrl, doc.name);
        onDocumentViewed(doc.id);
    };

    const renderInputField = (label: string, name: keyof Employee, value: string, type = 'text') => (
        <div>
            <label htmlFor={name as string} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input 
                type={type} 
                id={name as string} 
                name={name as string} 
                value={value} 
                onChange={handleInputChange} 
                className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
        </div>
    );

    const assignedCustomers = customers.filter(c => employee.assignedCustomerIds.includes(c.id));
    const employeeMaterialOrders = materialOrders
        .filter(order => order.employeeId === employee.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const renderOrderItem = (order: MaterialOrder) => (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Bestellung vom {new Date(order.date).toLocaleDateString('de-DE')}</p>
                    <p className={`text-sm font-semibold ${order.status === 'pending' ? 'text-amber-600' : 'text-green-600'}`}>Status: {order.status}</p>
                </div>
            </div>
             {order.items.length > 0 && (
                <div className="mt-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bestellte Artikel:</h4>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {order.items.map(item => (
                            <li key={item.id}>
                                {item.quantity} {item.unit || ''} {item.name} {item.details && `(${item.details})`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {order.returns && order.returns.length > 0 && (
                <div className="mt-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zurückgegebene Textilien:</h4>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {order.returns.map(item => (
                            <li key={item.id}>
                                {item.quantity}x {item.name} {item.details && `(${item.details})`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="name" 
                                value={editedEmployee.name} 
                                onChange={handleInputChange} 
                                className="text-3xl font-bold bg-transparent border-b-2 border-sky-500 focus:outline-none text-slate-800 dark:text-slate-100"
                            />
                        ) : (
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{employee.name}</h2>
                        )}
                        <p className="text-md text-slate-500 dark:text-slate-400 mt-1">
                            {employee.jobFunction || 'Keine Funktion zugewiesen'}
                            {employee.hourlyRate != null && ` (${employee.hourlyRate.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}/Std.)`}
                        </p>
                    </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => onNavigate('timesheet', undefined, undefined, undefined, employee.id)} className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800">
                            <DocumentTextIcon className="w-4 h-4" />
                            Stundenliste
                        </button>
                        {!isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                                    <EditIcon className="w-4 h-4" /> Bearbeiten
                                </button>
                                <button onClick={() => onDeleteEmployee(employee.id)} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors">
                                    <TrashIcon className="w-4 h-4" /> Mitarbeiter löschen
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {isEditing ? (
                        <>
                            {renderInputField("Benutzername", "username", editedEmployee.username || '')}
                            {renderInputField("Passwort", "password", editedEmployee.password || '', 'password')}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funktion</label>
                                <select name="jobFunction" value={jobFunctions.some(f => f.name === editedEmployee.jobFunction) ? editedEmployee.jobFunction : 'Sonstiges'} onChange={handleInputChange} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500">
                                    <option value="">Bitte auswählen...</option>
                                    {jobFunctions.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stundenlohn (€)</label>
                                <input type="number" name="hourlyRate" value={editedEmployee.hourlyRate ?? ''} onChange={handleNumericInputChange} step="0.01" className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500" />
                            </div>
                            {(editedEmployee.jobFunction === 'Sonstiges' || !jobFunctions.some(f => f.name === editedEmployee.jobFunction)) && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Funktion (benutzerdefiniert)</label>
                                    <input type="text" value={customJobFunction} onChange={(e) => setCustomJobFunction(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                </div>
                            )}
                        </>
                    ) : (
                         <div><p className="font-semibold text-slate-600 dark:text-slate-300">Benutzername</p><p>{employee.username}</p></div>
                    )}
                </div>

                 {isEditing && (
                     <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                         <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Stammdaten Lohnabrechnung</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {renderInputField("Sozialversicherungsnr.", "socialSecurityNumber", editedEmployee.socialSecurityNumber || '')}
                            {renderInputField("Krankenkasse", "healthInsurance", editedEmployee.healthInsurance || '')}
                            {renderInputField("Mitgliedsnummer KK", "healthInsuranceNumber", editedEmployee.healthInsuranceNumber || '')}
                             <div>
                                <label htmlFor="confession" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Konfession</label>
                                <select id="confession" name="confession" value={editedEmployee.confession || 'none'} onChange={handleInputChange} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500">
                                    <option value="none">Ohne Konfession</option>
                                    <option value="RK">Römisch-katholisch</option>
                                    <option value="EV">Evangelisch</option>
                                </select>
                            </div>
                            {renderInputField("IBAN", "iban", editedEmployee.iban || '')}
                            {renderInputField("BIC", "bic", editedEmployee.bic || '')}
                        </div>
                    </div>
                )}

                {!isEditing && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Stammdaten Lohnabrechnung</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Sozialversicherungsnr.</p><p>{employee.socialSecurityNumber || 'N/A'}</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Krankenkasse</p><p>{employee.healthInsurance || 'N/A'} ({employee.healthInsuranceNumber || 'N/A'})</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Konfession</p><p>{confessionMap[employee.confession || 'none']}</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">IBAN</p><p>{employee.iban || 'N/A'}</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">BIC</p><p>{employee.bic || 'N/A'}</p></div>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Zugeordnete Kunden</h3>
                    {isEditing ? (
                         <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            {customers.map(customer => (
                                <label key={customer.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={editedEmployee.assignedCustomerIds.includes(customer.id)}
                                        onChange={() => handleCustomerAssignmentChange(customer.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{customer.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                         assignedCustomers.length > 0 ? (
                            <ul className="space-y-2">
                                {assignedCustomers.map(c => (
                                    <li key={c.id} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">{c.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">Diesem Mitarbeiter sind keine Kunden zugeordnet.</p>
                        )
                    )}
                </div>

                 {isEditing && (
                    <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Abbrechen</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600">Speichern</button>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-3"><EnvelopeIcon className="w-6 h-6"/>Nachrichten</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                    {messages.length > 0 ? [...messages].sort((a,b)=>b.timestamp-a.timestamp).map(msg => (
                        <div key={msg.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                             <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <span>Von: {msg.sender}</span>
                                <span>{new Date(msg.timestamp).toLocaleString('de-DE')}</span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    )) : <p className="text-center text-sm text-slate-500 py-4">Keine Nachrichten gesendet.</p>}
                </div>
                 <div className="flex items-start gap-2">
                    <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nachricht an Mitarbeiter senden..." rows={2} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500"></textarea>
                    <button onClick={handleSendMessage} className="px-4 py-2 text-sm font-semibold bg-sky-700 text-white rounded-lg hover:bg-sky-800">Senden</button>
                </div>
            </div>

             {/* Documents */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-3"><DocumentArrowDownIcon className="w-6 h-6"/>Dokumente verwalten</h3>
                 <div className="space-y-3 mb-4">
                    {documents.length > 0 ? [...documents].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div>
                                <p className="font-semibold text-sky-800 dark:text-sky-300 text-sm">{doc.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Hochgeladen am: {new Date(doc.uploadDate).toLocaleDateString('de-DE')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleOpenDocument(doc)} className="text-sm text-sky-600 hover:underline">Öffnen</button>
                                <button onClick={() => onDeleteDocument(doc.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    )) : <p className="text-center text-sm text-slate-500 py-4">Keine Dokumente für diesen Mitarbeiter.</p>}
                 </div>
                 <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Dokumentenname</label>
                        <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="z.B. Lohnabrechnung 07/24" className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Kategorie</label>
                        <select value={docCategory} onChange={e => setDocCategory(e.target.value as EmployeeDocument['category'])} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg">
                            <option value="other">Sonstiges</option>
                            <option value="payslip">Lohnabrechnung</option>
                            <option value="contract">Vertrag</option>
                        </select>
                     </div>
                     <div className="md:col-span-3 flex flex-col">
                        <label className="block text-sm font-medium mb-1">Datei</label>
                        <input type="file" ref={docFileInputRef} onChange={handleDocFileChange} accept=".pdf,.html,.htm" className="text-sm text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/70 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-800"/>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={handleAddDocument} disabled={!docName || !docFile} className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-700 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-800 disabled:opacity-50">
                        <UploadIcon className="w-4 h-4"/> Hochladen
                    </button>
                </div>
            </div>

            <HistoryList<MaterialOrder>
                title="Bestellhistorie"
                items={employeeMaterialOrders}
                renderItem={renderOrderItem}
                searchKeys={['items', 'returns']}
            />
        </div>
    );
};

export default EmployeeDetail;
