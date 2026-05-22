
import React, { useState } from 'react';
import { EmployeeDocument } from '../data/documents';
import { DocumentArrowDownIcon, DownloadIcon, FolderIcon, DocumentDuplicateIcon } from '../components/icons';

interface DocumentsPageProps {
    documents: EmployeeDocument[];
    onDocumentViewed: (documentId: string) => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, onDocumentViewed }) => {
    const [activeTab, setActiveTab] = useState<'payslip' | 'contract'>('payslip');

    const payslips = documents
        .filter(d => d.category === 'payslip')
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    const contracts = documents
        .filter(d => d.category === 'contract' || d.category === 'other')
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    const handleOpenDocument = (doc: EmployeeDocument) => {
        onDocumentViewed(doc.id);
        window.open(doc.fileDataUrl, '_blank');
    };

    const renderDocumentList = (docs: EmployeeDocument[]) => {
        if (docs.length === 0) {
            return <p className="text-center text-slate-500 py-8">Keine Dokumente in dieser Kategorie vorhanden.</p>;
        }

        return (
            <div className="space-y-3">
                {docs.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
                        <div>
                            <p className="font-semibold text-sky-800 dark:text-sky-300">{doc.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hochgeladen am: {new Date(doc.uploadDate).toLocaleDateString('de-DE')}</p>
                        </div>
                        <button
                            onClick={() => handleOpenDocument(doc)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-700 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-800"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Öffnen
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <FolderIcon className="w-8 h-8 text-sky-700 dark:text-sky-300"/>
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Meine Dokumente</h2>
            </div>
            
            <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('payslip')}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium flex items-center gap-2 ${
                            activeTab === 'payslip'
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" /> Lohnabrechnungen
                    </button>
                    <button
                        onClick={() => setActiveTab('contract')}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium flex items-center gap-2 ${
                            activeTab === 'contract'
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                         <DocumentDuplicateIcon className="w-5 h-5" /> Verträge & Sonstiges
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'payslip' && renderDocumentList(payslips)}
                {activeTab === 'contract' && renderDocumentList(contracts)}
            </div>
        </div>
    );
};

export default DocumentsPage;
