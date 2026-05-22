
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import AcceptanceForm from './pages/AcceptanceForm';
import CustomersList from './pages/CustomersList';
import CustomerDetail from './pages/CustomerDetail';
import InvoiceForm from './pages/InvoiceForm';
import OfferForm from './pages/OfferForm';
import CustomerForm from './pages/CustomerForm';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeesList from './pages/EmployeesList';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';
import MaterialOrderForm from './pages/MaterialOrderForm';
import { customers as initialCustomers, Customer } from './data/customers';
import { acceptanceProtocols as initialProtocols, AcceptanceProtocol, ProtocolService, QualityFeedback } from './data/acceptanceProtocols';
import { invoices as initialInvoices, Invoice, InvoiceItem } from './data/invoices';
import { prospects as initialProspects, Prospect } from './data/prospects';
import { offers as initialOffers, Offer, OfferService } from './data/offers';
import { employees as initialEmployees, Employee, WorkSession, Location } from './data/employees';
import { materialOrders as initialMaterialOrders, MaterialOrder, OrderItem, ReturnItem } from './data/materialOrders';
import { contracts as initialContracts, Contract, PriceAdjustment } from './data/contracts';
import { qualityQuestions as initialQualityQuestions, QualityQuestion } from './data/qualityQuestions';
import { messages as initialMessages, Message } from './data/messages';
import { documents as initialDocuments, EmployeeDocument } from './data/documents';
import AcquisitionPage from './pages/AcquisitionPage';
import Login from './pages/Login';
import Settings from './pages/Settings';
import QualityPage from './pages/QualityPage';
import QualityFeedbackModal from './components/QualityFeedbackModal';
import { logoDataUrl } from './assets/logo';
import CustomerPortal from './pages/CustomerPortal';
import { calculateAutomaticBreak } from './utils/breakUtils';
import TimesheetPage from './pages/TimesheetPage';
import MessagesPage from './pages/MessagesPage';
import DocumentsPage from './pages/DocumentsPage';
import PayrollPage from './pages/PayrollPage';

export type Page = 
    'login' | 'settings' | 'quality' | 'customer-portal' | 'timesheet' | 'messages' | 'documents' |
    'dashboard' | 'acceptance-form' | 'customers-list' | 'customer-detail' | 
    'invoice-form' | 'acquisition' | 'offer-form' | 'customer-form' | 
    'employee-dashboard' | 'employees-list' | 'employee-detail' | 'employee-form' |
    'payroll' |
    'material-order';

export interface ActiveWorkSession {
    employeeId: string;
    customerId: string;
    startTime: number;
    startLocation?: Location;
}

export interface ProtocolInitialData {
    customerId: string;
    employees: string[];
    durationMs: number;
}

export interface NewProtocolData {
    customerId: string;
    employees: string[];
    date: string;
    durationMs: number;
    services: ProtocolService[];
    signature: string | null;
    status: 'Ausstehend' | 'Abgeschlossen';
    isLocked: boolean;
}

export interface NewContractData {
    customerId: string;
    title: string;
    date: string;
    fileDataUrl: string | null;
    startDate: string;
    durationMonths: number;
    noticePeriodMonths: number;
    autoRenews: boolean;
    priceAdjustments: PriceAdjustment[];
}

export interface NewPriceAdjustmentData {
    date: string;
    description: string;
    fileDataUrl: string;
}

export interface NewInvoiceData {
    customerId: string;
    protocolId?: string;
    date: string;
    items: InvoiceItem[];
    amount: number;
    status: 'Bezahlt' | 'Offen';
}

export interface NewProspectData {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export interface NewOfferData {
    prospectId: string;
    date: string;
    services: OfferService[];
    totalNet: number;
    vat: number;
    totalGross: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export interface NewCustomerData {
    name: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    password?: string;
    address: {
        street: string;
        zipCode: string;
        city: string;
    };
    propertySize: number;
    hourlyRate: number;
}

export interface NewEmployeeData {
    name: string;
    username: string;
    password: string;
    assignedCustomerIds: string[];
    permissions: Page[];
    jobFunction?: string;
    hourlyRate?: number;
}

export interface NewMaterialOrderData {
    employeeId: string;
    date: string;
    items: OrderItem[];
    returns: ReturnItem[];
    status: 'pending' | 'completed';
    signature: string;
}

export interface WorkSessionUpdateData {
    startTime?: number;
    endTime?: number;
    adjustedBreakDurationMs?: number;
}

const STORAGE_KEY = 'gebaeudereinigung_pro_state';

const App: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [userType, setUserType] = useState<'admin' | 'employee' | 'customer' | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<Employee | Customer | { id: string, name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [protocols, setProtocols] = useState<AcceptanceProtocol[]>(initialProtocols);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
    const [offers, setOffers] = useState<Offer[]>(initialOffers);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>(initialMaterialOrders);
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [qualityQuestions, setQualityQuestions] = useState<QualityQuestion[]>(initialQualityQuestions);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [documents, setDocuments] = useState<EmployeeDocument[]>(initialDocuments);
    const [logoUrl, setLogoUrl] = useState(logoDataUrl);
    const [activeWorkSession, setActiveWorkSession] = useState<ActiveWorkSession | null>(null);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
    const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [protocolInitialData, setProtocolInitialData] = useState<ProtocolInitialData | null>(null);
    const [qualityModalState, setQualityModalState] = useState({ isOpen: false, protocolIds: [] as string[] });

    // --- Load Data ---
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.customers) setCustomers(parsed.customers);
                if (parsed.protocols) setProtocols(parsed.protocols);
                if (parsed.invoices) setInvoices(parsed.invoices);
                if (parsed.prospects) setProspects(parsed.prospects);
                if (parsed.offers) setOffers(parsed.offers);
                if (parsed.employees) setEmployees(parsed.employees);
                if (parsed.materialOrders) setMaterialOrders(parsed.materialOrders);
                if (parsed.contracts) setContracts(parsed.contracts);
                if (parsed.qualityQuestions) setQualityQuestions(parsed.qualityQuestions);
                if (parsed.messages) setMessages(parsed.messages);
                if (parsed.documents) setDocuments(parsed.documents);
                if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
                if (parsed.activeWorkSession) setActiveWorkSession(parsed.activeWorkSession);
            } catch (e) { console.error("Restore error", e); }
        }
        setIsLoaded(true);
    }, []);

    // --- Auto Save ---
    useEffect(() => {
        if (!isLoaded) return;
        const state = { customers, protocols, invoices, prospects, offers, employees, materialOrders, contracts, qualityQuestions, logoUrl, messages, documents, activeWorkSession };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [isLoaded, customers, protocols, invoices, prospects, offers, employees, materialOrders, contracts, qualityQuestions, logoUrl, messages, documents, activeWorkSession]);

    const navigateTo = useCallback((page: Page, customerId?: string, protocolId?: string, prospectId?: string, employeeId?: string) => {
        setCurrentPage(page);
        setSelectedCustomerId(customerId || null);
        setSelectedProtocolId(protocolId || null);
        setSelectedProspectId(prospectId || null);
        setSelectedEmployeeId(employeeId || null);
    }, []);

    const getCurrentLocation = (): Promise<Location | undefined> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(undefined); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(undefined),
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        });
    };

    const handleStartWorkSession = async (customerId: string) => {
        if (!loggedInUser || userType !== 'employee') return;
        const loc = await getCurrentLocation();
        setActiveWorkSession({ employeeId: loggedInUser.id, customerId, startTime: Date.now(), startLocation: loc });
    };

    const handleEndWorkSession = async () => {
        if (!activeWorkSession || !loggedInUser) return;
        const loc = await getCurrentLocation();
        const endTime = Date.now();
        const duration = endTime - activeWorkSession.startTime;
        const newSession: WorkSession = {
            id: `ws_${Date.now()}`,
            customerId: activeWorkSession.customerId,
            startTime: activeWorkSession.startTime,
            endTime: endTime,
            duration: duration,
            breakDurationMs: calculateAutomaticBreak(duration),
            startLocation: activeWorkSession.startLocation,
            endLocation: loc
        };
        setEmployees(prev => prev.map(emp => emp.id === loggedInUser.id ? { ...emp, workSessions: [newSession, ...emp.workSessions] } : emp));
        setProtocolInitialData({ customerId: activeWorkSession.customerId, employees: [(loggedInUser as Employee).name], durationMs: duration });
        setActiveWorkSession(null);
        navigateTo('acceptance-form');
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };

    const handleAddEmployee = (data: NewEmployeeData) => {
        const newE: Employee = { 
            ...data, 
            id: `emp_${Date.now()}`, 
            workSessions: [] 
        };
        setEmployees(prev => [...prev, newE].sort((a,b) => a.name.localeCompare(b.name)));
        navigateTo('employees-list');
    };

    const handleDeleteEmployee = (employeeId: string) => {
        if (window.confirm("Sind Sie sicher, dass Sie diesen Mitarbeiter dauerhaft löschen möchten? Alle zugehörigen Daten gehen verloren.")) {
            setEmployees(prev => prev.filter(e => e.id !== employeeId));
            setMessages(prev => prev.filter(m => m.employeeId !== employeeId));
            setDocuments(prev => prev.filter(d => d.employeeId !== employeeId));
            navigateTo('employees-list');
        }
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const handleAddCustomer = (data: NewCustomerData) => {
        const newC: Customer = { ...data, id: `cust_${Date.now()}`, monthlyTarget: [], predefinedCosts: [] };
        setCustomers(prev => [...prev, newC].sort((a,b) => a.name.localeCompare(b.name)));
        navigateTo('customers-list');
    };

    const handleSendMessage = (employeeId: string, content: string) => {
        const msg: Message = { id: `msg_${Date.now()}`, employeeId, sender: 'Administrator', content, timestamp: Date.now(), isRead: false };
        setMessages(prev => [msg, ...prev]);
    };

    const handleAddDocument = (employeeId: string, name: string, fileDataUrl: string, category: EmployeeDocument['category']) => {
        const doc: EmployeeDocument = { 
            id: `doc_${Date.now()}`, 
            employeeId, 
            name, 
            fileDataUrl, 
            uploadDate: new Date().toISOString().split('T')[0],
            category,
            isOpened: false,
            isDownloaded: false,
        };
        setDocuments(prev => [doc, ...prev]);
    };

    const handleAddPayrollDocuments = (newDocs: EmployeeDocument[]) => {
        const existingDocKeys = new Set(
            documents.map(d => `${d.employeeId}-${d.name}`)
        );
        const uniqueNewDocs = newDocs.filter(
            d => !existingDocKeys.has(`${d.employeeId}-${d.name}`)
        );
        
        if (uniqueNewDocs.length < newDocs.length) {
            alert("Einige Lohnabrechnungen für diesen Monat und Mitarbeiter existieren bereits und wurden nicht erneut erstellt.");
        }
        
        if(uniqueNewDocs.length > 0) {
            setDocuments(prev => [...prev, ...uniqueNewDocs]);
            alert(`${uniqueNewDocs.length} Lohnabrechnung(en) wurde(n) erfolgreich erstellt und in den jeweiligen Mitarbeiterdokumenten abgelegt.`);
        } else {
            alert("Keine neuen Lohnabrechnungen erstellt, da für die ausgewählten Mitarbeiter bereits Dokumente für diesen Monat existieren.");
        }
    };

    const handleDeleteDocument = (id: string) => {
        if (window.confirm("Dokument löschen?")) setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const handleDocumentViewed = (documentId: string) => {
        setDocuments(prev => prev.map(doc => 
            doc.id === documentId ? { ...doc, isOpened: true, isDownloaded: true } : doc
        ));
    };

    const handleAddProtocol = (data: NewProtocolData) => {
        const newP = { ...data, id: `ap_${Date.now()}`, protocolNumber: `AP-${Date.now().toString().slice(-6)}` };
        setProtocols(prev => [newP, ...prev]);
        if (newP.signature) setQualityModalState({ isOpen: true, protocolIds: [newP.id] });
    };

    const handleAddInvoice = (data: NewInvoiceData) => {
        const inv: Invoice = { ...data, id: `inv_${Date.now()}`, invoiceNumber: `RE-${Date.now().toString().slice(-6)}` };
        setInvoices(prev => [inv, ...prev]);
        navigateTo('customer-detail', data.customerId);
    };

    const handleAddContract = (data: NewContractData) => {
        const c: Contract = { ...data, id: `ct_${Date.now()}` };
        setContracts(prev => [c, ...prev]);
    };

    const handleAddProspect = (data: NewProspectData) => {
        const p: Prospect = { ...data, id: `pr_${Date.now()}`, status: 'longlist' };
        setProspects(prev => [p, ...prev]);
    };

    const renderPage = () => {
        if (!isLoaded) return <div>Lade Daten...</div>;
        const customer = customers.find(c => c.id === selectedCustomerId);
        const employee = employees.find(e => e.id === selectedEmployeeId);
        const prospect = prospects.find(p => p.id === selectedProspectId);

        if (userType === 'employee' && loggedInUser) {
            const emp = loggedInUser as Employee;
            const empMsgs = messages.filter(m => m.employeeId === emp.id);
            switch (currentPage) {
                case 'acceptance-form': return <AcceptanceForm customers={customers} onAddProtocol={handleAddProtocol} onNavigate={navigateTo} initialData={protocolInitialData} onClearInitialData={() => setProtocolInitialData(null)}/>;
                case 'timesheet': return <TimesheetPage employees={employees} customers={customers} viewingEmployeeId={emp.id} loggedInUser={emp} userType="employee" onUpdateWorkSession={(eId, sId, d) => setEmployees(prev => prev.map(e => e.id === eId ? {...e, workSessions: e.workSessions.map(s => s.id === sId ? {...s, ...d} : s)} : e))} />;
                case 'messages': return <MessagesPage messages={empMsgs} onMarkAsRead={() => setMessages(prev => prev.map(m => m.employeeId === emp.id ? {...m, isRead: true} : m))} />;
                case 'documents': return <DocumentsPage documents={documents.filter(d => d.employeeId === emp.id)} onDocumentViewed={handleDocumentViewed} />;
                case 'material-order': return <MaterialOrderForm employee={emp} orderHistory={materialOrders} onAddOrder={(d) => setMaterialOrders(prev => [{...d, id:`mo_${Date.now()}`}, ...prev])} onCancel={() => navigateTo('employee-dashboard')} />;
                default: return <EmployeeDashboard employee={emp} assignedCustomers={customers.filter(c => emp.assignedCustomerIds.includes(c.id))} customers={customers} activeSession={activeWorkSession} onStartWork={handleStartWorkSession} onEndWork={handleEndWorkSession} onLogout={() => setUserType(null)} onNavigate={navigateTo} unreadMessagesCount={empMsgs.filter(m => !m.isRead).length} />;
            }
        }

        if (userType === 'admin') {
            switch (currentPage) {
                case 'customers-list': return <CustomersList customers={customers} protocols={protocols} onNavigate={navigateTo} />;
                case 'customer-detail': return customer ? <CustomerDetail customer={customer} protocols={protocols} invoices={invoices} contracts={contracts} onUpdateCustomer={handleUpdateCustomer} onAddContract={handleAddContract} onCancelContract={(id) => setContracts(prev => prev.map(c => c.id === id ? {...c, cancellationDate: new Date().toISOString()} : c))} onAddPriceAdjustment={(id, d) => setContracts(prev => prev.map(c => c.id === id ? {...c, priceAdjustments: [...c.priceAdjustments, {id:`pa_${Date.now()}`, ...d}]} : c))} onNavigate={navigateTo} onBulkSign={(ids, sig) => setProtocols(prev => prev.map(p => ids.includes(p.id) ? {...p, status:'Abgeschlossen', signature: sig} : p))} /> : null;
                case 'employees-list': return <EmployeesList employees={employees} onNavigate={navigateTo} />;
                case 'employee-detail': return employee ? <EmployeeDetail employee={employee} customers={customers} materialOrders={materialOrders} messages={messages.filter(m => m.employeeId === employee.id)} documents={documents.filter(d => d.employeeId === employee.id)} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} onNavigate={navigateTo} onSendMessage={handleSendMessage} onAddDocument={handleAddDocument} onDeleteDocument={handleDeleteDocument} onDocumentViewed={handleDocumentViewed} /> : null;
                case 'employee-form': return <EmployeeForm onAddEmployee={handleAddEmployee} onCancel={() => navigateTo('employees-list')} />;
                case 'timesheet': return <TimesheetPage employees={employees} customers={customers} viewingEmployeeId={selectedEmployeeId} loggedInUser={{id: 'admin'}} userType="admin" onUpdateWorkSession={(eId, sId, d) => setEmployees(prev => prev.map(e => e.id === eId ? {...e, workSessions: e.workSessions.map(s => s.id === sId ? {...s, ...d} : s)} : e))} />;
                case 'acquisition': return <AcquisitionPage prospects={prospects} onAddProspect={handleAddProspect} onUpdateProspectStatus={(id, s) => setProspects(prev => prev.map(p => p.id === id ? {...p, status: s} : p))} onConvertToCustomer={(p) => handleAddCustomer({ name: p.companyName, contactPerson: p.contactPerson, position: 'Ansprechpartner', phone: p.phone, email: p.email, address: { street: '', zipCode: '', city: '' }, propertySize: 0, hourlyRate: 0 })} onNavigate={navigateTo} />;
                case 'offer-form': return prospect ? <OfferForm prospect={prospect} onAddOffer={(d) => setOffers(prev => [{...d, id:`of_${Date.now()}`, offerNumber:`AN-${Date.now().toString().slice(-6)}`}, ...prev])} onCancel={() => navigateTo('acquisition')} /> : null;
                case 'customer-form': return <CustomerForm onAddCustomer={handleAddCustomer} onCancel={() => navigateTo('customers-list')} />;
                case 'invoice-form': return (customer && selectedProtocolId) ? <InvoiceForm customer={customer} protocol={protocols.find(p => p.id === selectedProtocolId)!} onAddInvoice={handleAddInvoice} onCancel={() => navigateTo('customer-detail', customer.id)} /> : null;
                case 'settings': return <Settings employees={employees} permissions={{}} onUpdatePermissions={() => {}} currentLogoUrl={logoUrl} onUpdateLogo={setLogoUrl} qualityQuestions={qualityQuestions} onAddQualityQuestion={(t) => setQualityQuestions([...qualityQuestions, {id: `q_${Date.now()}`, text: t, isActive: true}])} onToggleQualityQuestion={(id, active) => setQualityQuestions(qualityQuestions.map(q => q.id === id ? {...q, isActive: active} : q))} />;
                case 'quality': return <QualityPage protocols={protocols} customers={customers} qualityQuestions={qualityQuestions} />;
                case 'payroll': return <PayrollPage employees={employees} customers={customers} onNavigate={navigateTo} onAddPayrollDocuments={handleAddPayrollDocuments} />;
                default: return <Dashboard onNavigate={navigateTo} protocols={protocols} invoices={invoices} customers={customers} userType="admin" />;
            }
        }
        return <Dashboard onNavigate={navigateTo} protocols={protocols} invoices={invoices} customers={customers} userType={null} />;
    };

    if (!userType) return <Login employees={employees} customers={customers} onAdminLogin={() => { setUserType('admin'); setLoggedInUser({id:'admin', name:'Admin'}); navigateTo('dashboard'); }} onEmployeeLogin={(e) => { setUserType('employee'); setLoggedInUser(e); navigateTo('employee-dashboard'); }} onCustomerLogin={(c) => { setUserType('customer'); setLoggedInUser(c); navigateTo('customer-portal'); }} onLoadState={(s) => { if(s.customers) setCustomers(s.customers); }} logoUrl={logoUrl} />;

    return (
        <div className="min-h-screen bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex flex-col">
            <Header onNavigate={navigateTo} logoUrl={logoUrl} onLogout={() => setUserType(null)} onSaveState={() => alert("Daten sind lokal gesichert.")} />
            <main className="w-full max-w-4xl mx-auto p-4 md:p-8 flex-grow">{renderPage()}</main>
            {qualityModalState.isOpen && <QualityFeedbackModal qualityQuestions={qualityQuestions} onClose={() => setQualityModalState({ isOpen: false, protocolIds: [] })} onSubmit={(f) => { setProtocols(prev => prev.map(p => qualityModalState.protocolIds.includes(p.id) ? { ...p, qualityFeedback: f } : p)); setQualityModalState({ isOpen: false, protocolIds: [] }); }} />}
            <footer className="text-center p-4 text-slate-500 text-sm"><p>First Hauser Gebäudereinigung - Offline-Modus Aktiv</p></footer>
        </div>
    );
};

export default App;
