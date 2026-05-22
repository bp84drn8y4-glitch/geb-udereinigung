import React, { useState, useRef, useEffect } from 'react';
import { Customer } from '../data/customers';
import { employees as predefinedEmployees } from '../data/employees';
import { serviceData, ServiceCategory as ServiceCategoryType, ServiceItem } from '../data/services';
import ServiceCategory from '../components/ServiceCategory';
import SignatureCanvas from '../components/SignatureCanvas';
import { NewProtocolData, Page, ProtocolInitialData } from '../App';
import { CheckCircleIcon, ClockIcon, PlusIcon, XCircleIcon } from '../components/icons';
import { ProtocolService } from '../data/acceptanceProtocols';
import { formatDuration } from '../utils/timeUtils';

interface AcceptanceFormProps {
    customers: Customer[];
    onAddProtocol: (protocol: NewProtocolData) => void;
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string, employeeId?: string) => void;
    initialData?: ProtocolInitialData | null;
    onClearInitialData: () => void;
}

const findServiceById = (id: string, services: ServiceCategoryType[]): ServiceItem | null => {
    for (const category of services) {
        for (const item of category.items) {
            if (item.id === id) return item;
            if (item.subItems) {
                const subItemFound = item.subItems.find(sub => sub.id === id);
                if (subItemFound) return subItemFound;
            }
        }
    }
    return null;
};

const AcceptanceForm: React.FC<AcceptanceFormProps> = ({ customers, onAddProtocol, onNavigate, initialData, onClearInitialData }) => {
    const [customerId, setCustomerId] = useState('');
    const [otherCustomer, setOtherCustomer] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employees, setEmployees] = useState<string[]>([]);
    const [otherEmployee, setOtherEmployee] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [durationMs, setDurationMs] = useState(0);
    const [fulfilledServices, setFulfilledServices] = useState<Record<string, boolean>>({});
    const [customServiceTexts, setCustomServiceTexts] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    
    const signatureRef = useRef<{ clear: () => void; getSignature: () => string | null }>(null);

     useEffect(() => {
        if (initialData) {
            setCustomerId(initialData.customerId);
            setEmployees(initialData.employees);
            setDurationMs(initialData.durationMs);
            // Wichtig: onClearInitialData hier nicht aufrufen, um eine Schleife zu vermeiden.
            // Es wird jetzt in handleConfirmSubmit nach der Verarbeitung aufgerufen.
        }
    }, [initialData]);

    const resetForm = () => {
        setCustomerId('');
        setOtherCustomer('');
        setEmployees([]);
        setSelectedEmployee('');
        setOtherEmployee('');
        setDate(new Date().toISOString().split('T')[0]);
        setDurationMs(0);
        setFulfilledServices({});
        setCustomServiceTexts({});
        signatureRef.current?.clear();
    };

    const handleAddEmployee = (employeeToAdd: string) => {
        if (employeeToAdd && !employees.includes(employeeToAdd)) {
            setEmployees(prev => [...prev, employeeToAdd]);
        }
        setSelectedEmployee('');
        setOtherEmployee('');
    };

    const handleRemoveEmployee = (employeeToRemove: string) => {
        setEmployees(prev => prev.filter(e => e !== employeeToRemove));
    };

    const handleOpenConfirmation = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (durationMs <= 0) {
            alert("Die Arbeitszeit darf nicht null sein. Bitte geben Sie eine gültige Dauer ein.");
            return;
        }

        if (!customerId || employees.length === 0 || !date) {
            alert("Bitte füllen Sie alle erforderlichen Felder aus (Kunde, mindestens ein Mitarbeiter, Datum).");
            return;
        }
        setIsConfirming(true);
    };

    const handleConfirmSubmit = () => {
        setIsConfirming(false);
        const finalCustomerId = customerId === 'sonstige' ? 'other' : customerId;

        const selectedCustomer = customers.find(c => c.id === customerId);
        const targetServiceIds = selectedCustomer?.monthlyTarget?.map(t => t.serviceId) || [];

        const fulfilledServiceIds = Object.keys(fulfilledServices).filter(id => fulfilledServices[id]);
        
        const allRelevantIds = new Set([...targetServiceIds, ...fulfilledServiceIds]);

        const performedServices: ProtocolService[] = Array.from(allRelevantIds).map(id => {
            const service = findServiceById(id, serviceData);
            const customText = (service?.isCustom && customServiceTexts[id]) ? customServiceTexts[id] : undefined;
            return {
                serviceId: id,
                serviceName: service?.name || 'Unbekannter Service',
                isTarget: targetServiceIds.includes(id),
                isFulfilled: !!fulfilledServices[id],
                customText: customText
            };
        });
        
        const signature = signatureRef.current?.getSignature();

        const newProtocol: NewProtocolData = {
            customerId: finalCustomerId,
            employees: employees,
            date,
            durationMs: durationMs,
            services: performedServices,
            signature,
            status: signature ? 'Abgeschlossen' : 'Ausstehend',
            isLocked: true,
        };
        
        onAddProtocol(newProtocol);
        
        setShowSuccess(true);

        // Die Initialdaten löschen, nachdem sie verwendet wurden.
        if(initialData) {
            onClearInitialData();
        }

        setTimeout(() => {
            setShowSuccess(false);
            const targetPage = initialData ? 'employee-dashboard' : 'dashboard';
            onNavigate(targetPage);
        }, 2000);
        
        resetForm();
    };

    const handleServiceChange = (id: string, checked: boolean, type: 'item' | 'category' = 'item') => {
        const updates: Record<string, boolean> = {};

        const updateChildrenRecursive = (item: ServiceItem, isChecked: boolean) => {
            if (!item.isCustom) {
                updates[item.id] = isChecked;
            }
            if (item.subItems) {
                item.subItems.forEach(sub => updateChildrenRecursive(sub, isChecked));
            }
        };

        if (type === 'category') {
            const category = serviceData.find(c => c.id === id);
            if (category) {
                category.items.forEach(item => updateChildrenRecursive(item, checked));
            }
        } else { // type === 'item'
            const serviceItem = findServiceById(id, serviceData);
            if (serviceItem) {
                updateChildrenRecursive(serviceItem, checked);
            }
        }
    
        setFulfilledServices(prev => ({
            ...prev,
            ...updates
        }));
    };

    const handleCustomTextChange = (id: string, text: string) => {
        setCustomServiceTexts(prev => ({ ...prev, [id]: text }));
    };

    const loggedInEmployee = predefinedEmployees.find(e => initialData?.employees.includes(e.name));


    return (
        <form onSubmit={handleOpenConfirmation} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            {isConfirming && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
                        <h3 className="text-xl font-semibold mb-2 text-sky-800 dark:text-sky-300">Protokoll abschließen?</h3>
                        <p className="text-sm text-slate-500 mb-6">Möchten Sie das Protokoll final speichern? Es kann danach nicht mehr bearbeitet werden.</p>
                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => setIsConfirming(false)} className="px-6 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Abbrechen</button>
                            <button type="button" onClick={handleConfirmSubmit} className="px-6 py-2 text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg">Ja, speichern</button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg relative text-center" role="alert">
                    <strong className="font-bold flex items-center justify-center gap-2"><CheckCircleIcon className="w-5 h-5"/>Protokoll erfolgreich gespeichert!</strong>
                </div>
            )}
            <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Neues Abnahmeprotokoll</h2>
            
            {/* General Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kunde</label>
                    <select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300" disabled={!!initialData}>
                        <option value="">Bitte auswählen</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        <option value="sonstige">Sonstige</option>
                    </select>
                    {customerId === 'sonstige' && (
                        <input type="text" placeholder="Kundenname eingeben" value={otherCustomer} onChange={(e) => setOtherCustomer(e.target.value)} className="mt-2 w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    )}
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Datum der Leistung</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"/>
                </div>
                <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mitarbeiter</label>
                     <div className="flex gap-2">
                        <select 
                            value={selectedEmployee} 
                            onChange={(e) => handleAddEmployee(e.target.value)}
                            className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">Mitarbeiter hinzufügen...</option>
                            {predefinedEmployees
                                .filter(e => !employees.includes(e.name))
                                .map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                        </select>
                     </div>
                     <div className="flex gap-2 mt-2">
                        <input 
                            type="text" 
                            placeholder="Sonstiger Mitarbeiter..." 
                            value={otherEmployee} 
                            onChange={(e) => setOtherEmployee(e.target.value)} 
                            className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <button type="button" onClick={() => handleAddEmployee(otherEmployee)} className="p-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800"><PlusIcon className="w-5 h-5"/></button>
                     </div>
                     <div className="mt-2 flex flex-wrap gap-2">
                        {employees.map(e => (
                            <div key={e} className="flex items-center gap-2 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-sm font-medium px-2 py-1 rounded-full">
                                {e}
                                <button type="button" onClick={() => handleRemoveEmployee(e)} className="text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200">
                                    <XCircleIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
                <div>
                    <label htmlFor="workingHours" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Geleistete Arbeitszeit (HH:MM:SS)</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <ClockIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input 
                            type="text" 
                            id="workingHours" 
                            value={formatDuration(durationMs)}
                            readOnly
                            className="w-full p-2 pl-10 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 text-slate-700 dark:text-slate-200">Erbrachte Arbeiten</h3>
                {serviceData.map((category: ServiceCategoryType) => (
                    <ServiceCategory 
                        key={category.id} 
                        category={category}
                        serviceStates={fulfilledServices}
                        onServiceChange={handleServiceChange}
                        customServiceTexts={customServiceTexts}
                        onCustomTextChange={handleCustomTextChange}
                    />
                ))}
            </div>

            {/* Signature Section */}
            <div>
                 <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">Unterschrift Kunde (Optional)</h3>
                 <p className="text-sm text-slate-500 mb-2">Wird keine Unterschrift geleistet, wird das Protokoll zur späteren Abnahme gespeichert.</p>
                 <SignatureCanvas ref={signatureRef} />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    Protokoll speichern
                </button>
            </div>
        </form>
    );
};

export default AcceptanceForm;