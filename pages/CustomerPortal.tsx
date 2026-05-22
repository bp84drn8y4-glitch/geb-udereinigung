import React from 'react';
import { Customer } from '../data/customers';
import { AcceptanceProtocol } from '../data/acceptanceProtocols';
import { Invoice } from '../data/invoices';
import { Contract } from '../data/contracts';
import { DownloadIcon, LogoutIcon, DocumentTextIcon } from '../components/icons';
import { generateProtocolPDF, generateInvoicePDF, generateContractPDF } from '../utils/pdfUtils';

interface CustomerPortalProps {
    customer: Customer;
    protocols: AcceptanceProtocol[];
    invoices: Invoice[];
    contracts: Contract[];
    onLogout: () => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ customer, protocols, invoices, contracts, onLogout }) => {

    const DocumentRow: React.FC<{ title: string, date: string, onOpen: () => void }> = ({ title, date, onOpen }) => (
        <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
            <div>
                <p className="font-semibold text-sky-800 dark:text-sky-300">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(date).toLocaleDateString('de-DE')}</p>
            </div>
            <button
                onClick={onOpen}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-700 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-800"
            >
                <DownloadIcon className="w-4 h-4" />
                Öffnen
            </button>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans">
            <header className="w-full py-4 px-6 bg-white dark:bg-slate-900 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-sky-800 dark:text-sky-300">
                        Kundenportal: <span className="font-normal">{customer.name}</span>
                    </h1>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        <LogoutIcon className="w-4 h-4" />
                        Abmelden
                    </button>
                </div>
            </header>
            <main className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <p className="text-center text-slate-600 dark:text-slate-400">Willkommen in Ihrem persönlichen Dokumentenbereich. Hier finden Sie alle relevanten Unterlagen zu unseren Dienstleistungen.</p>
                
                {/* Contracts */}
                <details className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50" open>
                    <summary className="text-xl font-semibold cursor-pointer flex items-center gap-3 text-slate-700 dark:text-slate-200">
                        <DocumentTextIcon className="w-6 h-6"/>
                        Verträge ({contracts.length})
                    </summary>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                         {contracts.length > 0 ? (
                            contracts.map(contract => (
                                <DocumentRow 
                                    key={contract.id}
                                    title={contract.title}
                                    date={contract.date}
                                    onOpen={() => {
                                        if (contract.fileDataUrl) {
                                            window.open(contract.fileDataUrl, '_blank');
                                        } else {
                                            generateContractPDF(customer, contract);
                                        }
                                    }}
                                />
                            ))
                        ) : <p className="text-slate-500 text-center py-2">Keine Verträge vorhanden.</p>}
                    </div>
                </details>

                {/* Acceptance Protocols */}
                <details className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50" open>
                    <summary className="text-xl font-semibold cursor-pointer flex items-center gap-3 text-slate-700 dark:text-slate-200">
                        <DocumentTextIcon className="w-6 h-6"/>
                        Abnahmeprotokolle ({protocols.length})
                    </summary>
                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                        {protocols.length > 0 ? (
                            protocols.map(protocol => (
                                <DocumentRow 
                                    key={protocol.id}
                                    title={`Protokoll ${protocol.protocolNumber}`}
                                    date={protocol.date}
                                    onOpen={() => generateProtocolPDF(customer, protocol)}
                                />
                            ))
                        ) : <p className="text-slate-500 text-center py-2">Keine Abnahmeprotokolle vorhanden.</p>}
                    </div>
                </details>

                {/* Invoices */}
                <details className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50" open>
                     <summary className="text-xl font-semibold cursor-pointer flex items-center gap-3 text-slate-700 dark:text-slate-200">
                        <DocumentTextIcon className="w-6 h-6"/>
                        Rechnungen ({invoices.length})
                    </summary>
                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                        {invoices.length > 0 ? (
                            invoices.map(invoice => (
                                 <DocumentRow 
                                    key={invoice.id}
                                    title={`Rechnung ${invoice.invoiceNumber}`}
                                    date={invoice.date}
                                    onOpen={() => generateInvoicePDF(customer, invoice)}
                                />
                            ))
                        ) : <p className="text-slate-500 text-center py-2">Keine Rechnungen vorhanden.</p>}
                    </div>
                </details>
            </main>
             <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm">
                <p>First Hauser Gebäudereinigung & Gebäudeservice</p>
            </footer>
        </div>
    );
};

export default CustomerPortal;