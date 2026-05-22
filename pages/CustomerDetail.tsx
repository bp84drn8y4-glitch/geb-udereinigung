import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Customer, MonthlyTargetService, PerformanceUnit, CostItem } from '../data/customers';
import { AcceptanceProtocol, ProtocolService } from '../data/acceptanceProtocols';
import { Invoice } from '../data/invoices';
import { Contract, PriceAdjustment } from '../data/contracts';
import HistoryList from '../components/HistoryList';
import { DocumentTextIcon, EditIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, TrashIcon, CurrencyEuroIcon, PencilSquareIcon, PlusIcon } from '../components/icons';
import { exportProtocolsToPDF_Admin } from '../utils/pdfUtils';
import { serviceData } from '../data/services';
import { Page, NewContractData, NewPriceAdjustmentData } from '../App';
import SignatureCanvas from '../components/SignatureCanvas';
import { formatDuration } from '../utils/timeUtils';
import { addMonths, subMonths, formatDate } from '../utils/dateUtils';

interface CustomerDetailProps {
    customer: Customer;
    onUpdateCustomer: (customer: Customer) => void;
    protocols: AcceptanceProtocol[];
    invoices: Invoice[];
    contracts: Contract[];
    onAddContract: (contract: NewContractData) => void;
    onCancelContract: (contractId: string) => void;
    onAddPriceAdjustment: (contractId: string, data: NewPriceAdjustmentData) => void;
    onNavigate: (page: Page, customerId: string, protocolId?: string) => void;
    onBulkSign: (protocolIds: string[], signature: string) => void;
}

const allServicesFlat = serviceData.flatMap(cat => 
    cat.items.flatMap(item => (item.subItems ? [item, ...item.subItems] : [item]))
);

const getServiceNameById = (id: string): string => {
    return allServicesFlat.find(s => s.id === id)?.name || 'Unbekannte Leistung';
};

const formatUnit = (unit: PerformanceUnit, value: number) => {
    switch (unit) {
        case 'hours':
            return `${value.toLocaleString('de-DE')} Stunde(n)`;
        case 'sqm_price':
            return `${value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / m²`;
        default:
            return `${value}`;
    }
};

const ContractDetailsCard: React.FC<{
    contract: Contract;
    onCancelContract: (contractId: string) => void;
    onAddPriceAdjustment: (contractId: string, data: NewPriceAdjustmentData) => void;
}> = ({ contract, onCancelContract, onAddPriceAdjustment }) => {
    
    const [paDescription, setPaDescription] = useState('');
    const [paFile, setPaFile] = useState<string | null>(null);
    const [paFileName, setPaFileName] = useState('');
    const paFileInputRef = useRef<HTMLInputElement>(null);

    const contractDates = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const startDate = new Date(contract.startDate);
        const endDate = addMonths(startDate, contract.durationMonths);
        const noticeDeadline = subMonths(endDate, contract.noticePeriodMonths);
        
        let status: 'Aktiv' | 'Gekündigt' | 'Kündigungsfrist läuft' | 'Abgelaufen' = 'Aktiv';
        let statusColor = 'text-green-600 dark:text-green-400';

        if (contract.cancellationDate) {
            status = 'Gekündigt';
            statusColor = 'text-slate-500';
        } else if (today >= noticeDeadline && today < endDate) {
            status = 'Kündigungsfrist läuft';
            statusColor = 'text-amber-600 dark:text-amber-400';
        } else if (today >= endDate) {
            status = 'Abgelaufen';
            statusColor = 'text-red-600 dark:text-red-400';
        }

        return {
            endDate: formatDate(endDate),
            noticeDeadline: formatDate(noticeDeadline),
            status,
            statusColor,
        };
    }, [contract]);

    const handlePaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPaFile(event.target?.result as string);
                setPaFileName(file.name);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Bitte nur PDF-Dateien hochladen.");
            setPaFile(null);
            setPaFileName('');
        }
    };
    
    const handleAddPriceAdjustment = () => {
        if(!paDescription || !paFile) {
            alert("Bitte Beschreibung ausfüllen und eine Datei auswählen.");
            return;
        }
        onAddPriceAdjustment(contract.id, {
            date: new Date().toISOString().split('T')[0],
            description: paDescription,
            fileDataUrl: paFile,
        });
        // Reset form
        setPaDescription('');
        setPaFile(null);
        setPaFileName('');
        if(paFileInputRef.current) paFileInputRef.current.value = '';
    };

    return (
        <details className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700" open>
            <summary className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex justify-between items-center">
                <span>{contract.title}</span>
                <span className={`text-sm font-semibold ${contractDates.statusColor}`}>{contractDates.status}</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-semibold text-slate-500">Beginn</p><p>{formatDate(contract.startDate)}</p></div>
                    <div><p className="font-semibold text-slate-500">Ende</p><p>{contractDates.endDate}</p></div>
                    <div><p className="font-semibold text-slate-500">Kündigungsfrist bis</p><p>{contractDates.noticeDeadline}</p></div>
                    <div><p className="font-semibold text-slate-500">Automatische Verlängerung</p><p>{contract.autoRenews ? 'Ja' : 'Nein'}</p></div>
                </div>
                 <div className="flex justify-end items-center gap-4">
                    {contract.fileDataUrl && <a href={contract.fileDataUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-600 hover:underline">Hauptvertrag öffnen</a>}
                    {!contract.cancellationDate && <button onClick={() => onCancelContract(contract.id)} className="px-3 py-1 text-xs bg-amber-500 text-white font-semibold rounded-lg shadow-sm hover:bg-amber-600">Vertrag kündigen</button>}
                </div>

                {/* Price Adjustments */}
                <div className="space-y-3">
                    <h5 className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Preisanpassungen</h5>
                    {contract.priceAdjustments.length > 0 ? (
                        contract.priceAdjustments.map(pa => (
                            <div key={pa.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800/70 rounded-md text-xs">
                                <div>
                                    <p className="font-medium">{pa.description}</p>
                                    <p className="text-slate-500">vom {formatDate(pa.date)}</p>
                                </div>
                                <a href={pa.fileDataUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-600 hover:underline">Dokument ansehen</a>
                            </div>
                        ))
                    ) : <p className="text-xs text-slate-500 italic">Keine Preisanpassungen vorhanden.</p>}
                     <div className="p-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                        <input type="text" placeholder="Beschreibung" value={paDescription} onChange={e => setPaDescription(e.target.value)} className="w-full text-xs p-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md"/>
                        <input type="file" ref={paFileInputRef} onChange={handlePaFileChange} accept="application/pdf" className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/70 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-800"/>
                        <button onClick={handleAddPriceAdjustment} className="px-3 py-2 text-xs bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700">Hinzufügen</button>
                    </div>
                </div>
            </div>
        </details>
    );
};


const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onUpdateCustomer, protocols, invoices, contracts, onAddContract, onCancelContract, onAddPriceAdjustment, onNavigate, onBulkSign }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
    const [editedMonthlyTarget, setEditedMonthlyTarget] = useState<MonthlyTargetService[]>([]);
    const [editedPredefinedCosts, setEditedPredefinedCosts] = useState<CostItem[]>([]);
    
    // New Contract Form State
    const [newContractTitle, setNewContractTitle] = useState('');
    const [newContractDate, setNewContractDate] = useState(new Date().toISOString().split('T')[0]);
    const [newContractFile, setNewContractFile] = useState<string | null>(null);
    const [newContractFileName, setNewContractFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newContractStartDate, setNewContractStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [newContractDuration, setNewContractDuration] = useState('12');
    const [newContractNotice, setNewContractNotice] = useState('1');
    const [newContractAutoRenews, setNewContractAutoRenews] = useState(true);


    const [newTargetServiceId, setNewTargetServiceId] = useState('');
    const [newTargetUnit, setNewTargetUnit] = useState<PerformanceUnit>('hours');
    const [newTargetValue, setNewTargetValue] = useState('');
    
    const [newCostName, setNewCostName] = useState('');
    const [newCostType, setNewCostType] = useState<CostItem['type']>('travel');
    const [newCostPrice, setNewCostPrice] = useState('');

    const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
    const [isSigning, setIsSigning] = useState(false);
    const signatureRef = useRef<{ clear: () => void; getSignature: () => string | null }>(null);

    useEffect(() => {
        setEditedCustomer(customer);
        setEditedMonthlyTarget(customer.monthlyTarget || []);
        setEditedPredefinedCosts(customer.predefinedCosts || []);
    }, [customer]);

    const allCustomerProtocols = protocols
        .filter(p => p.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    const pendingProtocols = allCustomerProtocols.filter(p => p.status === 'Ausstehend');
    const completedProtocols = allCustomerProtocols.filter(p => p.status === 'Abgeschlossen');
        
    const customerInvoices = invoices
        .filter(i => i.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const customerContracts = contracts
        .filter(c => c.customerId === customer.id)
        .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedCustomer(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedCustomer(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const handleSave = () => {
        onUpdateCustomer({ 
            ...editedCustomer, 
            monthlyTarget: editedMonthlyTarget,
            predefinedCosts: editedPredefinedCosts 
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedCustomer(customer);
        setEditedMonthlyTarget(customer.monthlyTarget || []);
        setEditedPredefinedCosts(customer.predefinedCosts || []);
        setIsEditing(false);
    };
    
    const handleAddTargetService = () => {
        const numericValue = parseFloat(newTargetValue);
        if (!newTargetServiceId || isNaN(numericValue) || numericValue <= 0) return alert("Bitte eine Leistung und einen gültigen Wert eingeben.");
        if (editedMonthlyTarget.some(t => t.serviceId === newTargetServiceId)) return alert("Diese Leistung ist bereits im Soll enthalten.");
        setEditedMonthlyTarget(prev => [...prev, { serviceId: newTargetServiceId, unit: newTargetUnit, value: numericValue }].sort((a, b) => a.serviceId.localeCompare(b.serviceId)));
        setNewTargetServiceId(''); setNewTargetUnit('hours'); setNewTargetValue('');
    };
    
    const handleRemoveTargetService = (serviceId: string) => setEditedMonthlyTarget(prev => prev.filter(s => s.serviceId !== serviceId));

    const handleAddPredefinedCost = () => {
        const numericPrice = parseFloat(newCostPrice);
        if (!newCostName || isNaN(numericPrice) || numericPrice <= 0) return alert("Bitte Name und gültigen Preis für die Kosten eingeben.");
        setEditedPredefinedCosts(prev => [...prev, { id: `cost_${Date.now()}`, name: newCostName, type: newCostType, price: numericPrice }]);
        setNewCostName(''); setNewCostType('travel'); setNewCostPrice('');
    };

    const handleRemovePredefinedCost = (id: string) => setEditedPredefinedCosts(prev => prev.filter(c => c.id !== id));
    
    const handleTogglePendingSelection = (protocolId: string) => {
        setSelectedPendingIds(prev => 
            prev.includes(protocolId) 
                ? prev.filter(id => id !== protocolId) 
                : [...prev, protocolId]
        );
    };

    const handleConfirmSignature = () => {
        const signature = signatureRef.current?.getSignature();
        if (!signature) {
            alert("Bitte leisten Sie eine Unterschrift.");
            return;
        }
        onBulkSign(selectedPendingIds, signature);
        setIsSigning(false);
        setSelectedPendingIds([]);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewContractFile(event.target?.result as string);
                setNewContractFileName(file.name);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Fehler beim Lesen der Datei.");
            };
            reader.readAsDataURL(file);
        } else {
            alert("Bitte laden Sie nur PDF-Dateien hoch.");
            setNewContractFile(null);
            setNewContractFileName('');
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddContract = () => {
        if (!newContractTitle || !newContractStartDate || !newContractFile) {
            alert("Bitte Titel, Startdatum und eine PDF-Datei für den Vertrag angeben.");
            return;
        }
        const duration = parseInt(newContractDuration, 10);
        const notice = parseInt(newContractNotice, 10);
        if(isNaN(duration) || isNaN(notice) || duration <= 0 || notice < 0) {
            alert("Bitte geben Sie eine gültige Laufzeit und Kündigungsfrist an.");
            return;
        }
        onAddContract({
            customerId: customer.id,
            title: newContractTitle,
            date: newContractDate,
            fileDataUrl: newContractFile,
            startDate: newContractStartDate,
            durationMonths: duration,
            noticePeriodMonths: notice,
            autoRenews: newContractAutoRenews,
            priceAdjustments: []
        });
        // Reset form
        setNewContractTitle('');
        setNewContractDate(new Date().toISOString().split('T')[0]);
        setNewContractFile(null);
        setNewContractFileName('');
        if(fileInputRef.current) fileInputRef.current.value = '';
        setNewContractStartDate(new Date().toISOString().split('T')[0]);
        setNewContractDuration('12');
        setNewContractNotice('1');
        setNewContractAutoRenews(true);
    };

    const renderServiceItem = (service: ProtocolService, index: number) => {
        let icon, textColor, label;
        if (service.isTarget && service.isFulfilled) { icon = <CheckCircleIcon className="w-5 h-5 text-green-500" />; textColor = "text-slate-600 dark:text-slate-400"; label = "(erfüllt)"; } 
        else if (service.isTarget && !service.isFulfilled) { icon = <XCircleIcon className="w-5 h-5 text-red-500" />; textColor = "text-red-700 dark:text-red-400 font-semibold"; label = "(Mangel)"; } 
        else if (!service.isTarget && service.isFulfilled) { icon = <PlusCircleIcon className="w-5 h-5 text-sky-500" />; textColor = "text-sky-700 dark:text-sky-400"; label = "(Zusatzleistung)"; } 
        else return null;
        
        return (
            <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">{icon}</span>
                <span className={`${textColor} text-sm`}>
                    {service.serviceName} <span className="font-normal text-slate-500 dark:text-slate-500">{label}</span>
                    {service.customText && <span className="text-xs italic text-slate-500 ml-1">- "{service.customText}"</span>}
                </span>
            </li>
        );
    };
    
    const renderProtocolItem = (protocol: AcceptanceProtocol, isPending = false) => {
        const hasInvoice = invoices.some(inv => inv.protocolId === protocol.id);
        return (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                     {isPending && (
                        <input 
                            type="checkbox"
                            checked={selectedPendingIds.includes(protocol.id)}
                            onChange={() => handleTogglePendingSelection(protocol.id)}
                            className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 mr-4 mt-1"
                        />
                    )}
                    <div className="flex-grow">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{protocol.protocolNumber}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mitarbeiter: {protocol.employees.join(', ')}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Dauer: {formatDuration(protocol.durationMs)}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{new Date(protocol.date).toLocaleDateString('de-DE')}</p>
                </div>
                <ul className="mt-3 space-y-1.5 ml-9">{(protocol.services || []).map(renderServiceItem).filter(Boolean)}</ul>
                {!isPending && (
                    <div className="flex justify-end mt-3">
                        <button 
                            onClick={() => onNavigate('invoice-form', customer.id, protocol.id)}
                            disabled={hasInvoice}
                            className="flex items-center gap-2 px-3 py-1 text-xs bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <CurrencyEuroIcon className="w-4 h-4"/>
                            {hasInvoice ? 'Abgerechnet' : 'Rechnung erstellen'}
                        </button>
                    </div>
                )}
            </div>
        );
    };


    const renderInvoiceItem = (invoice: Invoice) => (
         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Betrag: {invoice.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                </div>
                 <div className="flex items-center gap-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'Bezahlt' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{invoice.status}</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{new Date(invoice.date).toLocaleDateString('de-DE')}</p>
                </div>
            </div>
        </div>
    );
    
    const renderInputField = (label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type = 'text') => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input type={type} id={name} name={name} value={value} onChange={onChange} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-300"/>
        </div>
    );

    return (
        <div className="space-y-8">
            {isSigning && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-semibold mb-2">Abnahme für {selectedPendingIds.length} Protokolle</h3>
                        <p className="text-sm text-slate-500 mb-4">Bitte unterschreiben Sie, um die ausgewählten Leistungen zu bestätigen.</p>
                        <SignatureCanvas ref={signatureRef} />
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setIsSigning(false)} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg">Abbrechen</button>
                            <button onClick={handleConfirmSignature} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg">Unterschreiben & Bestätigen</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {isEditing ? <input type="text" name="name" value={editedCustomer.name} onChange={handleInputChange} className="text-3xl font-bold bg-transparent border-b-2 border-sky-500 focus:outline-none text-slate-800 dark:text-slate-100"/> : <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{customer.name}</h2>}
                        {isEditing ? <input type="text" name="contactPerson" placeholder="Ansprechpartner" value={editedCustomer.contactPerson} onChange={handleInputChange} className="mt-1 text-md bg-transparent border-b border-slate-400 focus:outline-none text-slate-500 dark:text-slate-400"/> : <p className="text-md text-slate-500 dark:text-slate-400 mt-1">{customer.contactPerson} ({customer.position})</p>}
                    </div>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><EditIcon className="w-4 h-4" /> Bearbeiten</button>}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {isEditing ? (
                        <>
                           {renderInputField("Position", "position", editedCustomer.position, handleInputChange)}
                           {renderInputField("Telefon", "phone", editedCustomer.phone, handleInputChange, 'tel')}
                           {renderInputField("E-Mail", "email", editedCustomer.email, handleInputChange, 'email')}
                           {renderInputField("Straße", "street", editedCustomer.address.street, handleAddressChange)}
                           {renderInputField("PLZ", "zipCode", editedCustomer.address.zipCode, handleAddressChange)}
                           {renderInputField("Stadt", "city", editedCustomer.address.city, handleAddressChange)}
                           {renderInputField("Fläche (m²)", "propertySize", editedCustomer.propertySize, handleInputChange, 'number')}
                           {renderInputField("Stundenverrechnungssatz (€)", "hourlyRate", editedCustomer.hourlyRate, handleInputChange, 'number')}
                           <div className="sm:col-span-2">
                                {renderInputField("Kundenportal Passwort", "password", editedCustomer.password || '', handleInputChange, 'password')}
                           </div>
                        </>
                    ) : (
                        <>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Anschrift</p><p>{customer.address.street}, {customer.address.zipCode} {customer.address.city}</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Fläche</p><p>{customer.propertySize} m²</p></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">E-Mail</p><a href={`mailto:${customer.email}`} className="text-sky-600 dark:text-sky-400 hover:underline">{customer.email}</a></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Telefon</p><a href={`tel:${customer.phone}`} className="text-sky-600 dark:text-sky-400 hover:underline">{customer.phone}</a></div>
                            <div><p className="font-semibold text-slate-600 dark:text-slate-300">Stundensatz</p><p>{customer.hourlyRate.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p></div>
                        </>
                    )}
                </div>

                 {!isEditing && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Monatliches Soll</h3>
                         {(customer.monthlyTarget || []).length > 0 ? (
                            <ul className="space-y-2">{(customer.monthlyTarget || []).map(target => (<li key={target.serviceId} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg"><span>{getServiceNameById(target.serviceId)}</span><strong className="text-slate-800 dark:text-slate-100">{formatUnit(target.unit, target.value)}</strong></li>))}</ul>
                        ) : <p className="text-slate-500 dark:text-slate-400">Kein monatliches Soll definiert.</p>}
                    </div>
                )}
                 {!isEditing && (customer.predefinedCosts || []).length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">Vordefinierte Zusatzkosten</h3>
                        <ul className="space-y-2">{(customer.predefinedCosts || []).map(cost => (<li key={cost.id} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg"><span>{cost.name} ({cost.type})</span><strong className="text-slate-800 dark:text-slate-100">{cost.price.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</strong></li>))}</ul>
                    </div>
                )}

                {isEditing && (
                    <>
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Monatliches Soll verwalten</h3>
                        <div className="space-y-2 mb-4">
                            {editedMonthlyTarget.map(target => (<div key={target.serviceId} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><div><p className="font-medium">{getServiceNameById(target.serviceId)}</p><p className="text-sm text-slate-500 dark:text-slate-400">{formatUnit(target.unit, target.value)}</p></div><button onClick={() => handleRemoveTargetService(target.serviceId)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button></div>))}
                            {editedMonthlyTarget.length === 0 && <p className="text-center text-slate-500 py-2">Keine Soll-Leistungen hinzugefügt.</p>}
                        </div>
                        <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leistung</label><select value={newTargetServiceId} onChange={e => setNewTargetServiceId(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"><option value="">Bitte auswählen</option>{serviceData.map(category => (<optgroup key={category.id} label={category.name}>{category.items.map(item => (<><option key={item.id} value={item.id}>{item.name}</option>{item.subItems && item.subItems.map(subItem => (<option key={subItem.id} value={subItem.id}>&nbsp;&nbsp;&nbsp;{subItem.name}</option>))}</>))}</optgroup>))}</select></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Einheit</label><select value={newTargetUnit} onChange={e => setNewTargetUnit(e.target.value as PerformanceUnit)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"><option value="hours">Stunden</option><option value="sqm_price">Preis / m²</option></select></div>
                            <div className="flex items-end gap-2"><div className="flex-grow"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wert</label><input type="number" value={newTargetValue} onChange={e => setNewTargetValue(e.target.value)} placeholder="z.B. 10" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" /></div><button type="button" onClick={handleAddTargetService} className="h-10 px-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors">+</button></div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Zusatzkosten verwalten</h3>
                         <div className="space-y-2 mb-4">
                            {editedPredefinedCosts.map(cost => (<div key={cost.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><div><p className="font-medium">{cost.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{cost.price.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})} ({cost.type})</p></div><button onClick={() => handleRemovePredefinedCost(cost.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button></div>))}
                            {editedPredefinedCosts.length === 0 && <p className="text-center text-slate-500 py-2">Keine Zusatzkosten hinzugefügt.</p>}
                        </div>
                        <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label><input type="text" value={newCostName} onChange={e => setNewCostName(e.target.value)} placeholder="z.B. Anfahrt Pauschale" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Typ</label><select value={newCostType} onChange={e => setNewCostType(e.target.value as CostItem['type'])} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"><option value="travel">Anfahrt</option><option value="material">Material</option><option value="machine">Maschine</option></select></div>
                            <div className="flex items-end gap-2"><div className="flex-grow"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preis (€)</label><input type="number" value={newCostPrice} onChange={e => setNewCostPrice(e.target.value)} placeholder="z.B. 25.50" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg" /></div><button type="button" onClick={handleAddPredefinedCost} className="h-10 px-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors">+</button></div>
                        </div>
                    </div>
                    </>
                )}


                {isEditing && (
                    <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Abbrechen</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">Speichern</button>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Verträge</h3>
                    <div className="space-y-4">
                        {customerContracts.length > 0 ? (
                            customerContracts.map(contract => (
                                <ContractDetailsCard 
                                    key={contract.id} 
                                    contract={contract} 
                                    onCancelContract={onCancelContract}
                                    onAddPriceAdjustment={onAddPriceAdjustment}
                                />
                            ))
                        ) : <p className="text-center text-slate-500 py-4">Keine Verträge für diesen Kunden vorhanden.</p>}
                    </div>
                </div>
                
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Neuen Vertrag hochladen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                         <div>
                             <label htmlFor="contractTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vertragstitel</label>
                             <input type="text" id="contractTitle" value={newContractTitle} onChange={e => setNewContractTitle(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                        </div>
                         <div>
                             <label htmlFor="contractDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Datum des Dokuments</label>
                             <input type="date" id="contractDate" value={newContractDate} onChange={e => setNewContractDate(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                        </div>
                        <div>
                             <label htmlFor="contractStartDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vertragsbeginn</label>
                             <input type="date" id="contractStartDate" value={newContractStartDate} onChange={e => setNewContractStartDate(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="contractDuration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Laufzeit (Monate)</label>
                                <input type="number" id="contractDuration" value={newContractDuration} onChange={e => setNewContractDuration(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                            </div>
                             <div>
                                <label htmlFor="contractNotice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">K-Frist (Monate)</label>
                                <input type="number" id="contractNotice" value={newContractNotice} onChange={e => setNewContractNotice(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="contractFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PDF-Datei</label>
                             <input type="file" id="contractFile" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/70 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-800"/>
                             {newContractFileName && <p className="text-xs text-slate-500 mt-1">Ausgewählt: {newContractFileName}</p>}
                        </div>
                         <div className="flex items-center gap-3">
                             <input type="checkbox" id="autoRenews" checked={newContractAutoRenews} onChange={e => setNewContractAutoRenews(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                             <label htmlFor="autoRenews" className="text-sm font-medium text-slate-700 dark:text-slate-300">Verlängert sich automatisch</label>
                        </div>
                    </div>
                     <div className="flex justify-end mt-4">
                        <button onClick={handleAddContract} className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-700 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-800 disabled:opacity-50" disabled={!newContractFile || !newContractTitle}>
                            <PlusIcon className="w-4 h-4"/> Vertrag hinzufügen
                        </button>
                    </div>
                </div>

                 {pendingProtocols.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-amber-300 dark:border-amber-700/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold flex items-center text-amber-600 dark:text-amber-400">Offene Abnahmen</h3>
                            {selectedPendingIds.length > 0 && (
                                <button onClick={() => setIsSigning(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-500 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-600">
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Ausgewählte abnehmen ({selectedPendingIds.length})
                                </button>
                            )}
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                             {pendingProtocols.map(p => <div key={p.id}>{renderProtocolItem(p, true)}</div>)}
                        </div>
                    </div>
                )}

                <HistoryList<AcceptanceProtocol> title="Abnahmehistorie" items={completedProtocols} renderItem={(p) => renderProtocolItem(p, false)} searchKeys={['protocolNumber', 'employees', 'services']} icon={<DocumentTextIcon className="w-6 h-6 mr-2" />} exportButtonLabel="PDF Export" onExport={(filteredItems) => exportProtocolsToPDF_Admin(customer, filteredItems)} />
                <HistoryList<Invoice> title="Rechnungen" items={customerInvoices} renderItem={renderInvoiceItem} searchKeys={['invoiceNumber', 'amount', 'status']} icon={<DocumentTextIcon className="w-6 h-6 mr-2" />} />
            </div>
        </div>
    );
};

export default CustomerDetail;