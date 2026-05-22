import React, { useState } from 'react';
import { Prospect } from '../data/prospects';
import { ProspectCard } from '../components/ProspectCard';
import { NewProspectData, Page } from '../App';
import { MegaphoneIcon } from '../components/icons';

interface AcquisitionPageProps {
    prospects: Prospect[];
    onAddProspect: (prospect: NewProspectData) => void;
    onUpdateProspectStatus: (id: string, newStatus: Prospect['status']) => void;
    onConvertToCustomer: (prospect: Prospect) => void;
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string) => void;
}

const AcquisitionPage: React.FC<AcquisitionPageProps> = ({ prospects, onAddProspect, onUpdateProspectStatus, onConvertToCustomer, onNavigate }) => {
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName || !contactPerson) {
            alert('Bitte Firmenname und Ansprechpartner angeben.');
            return;
        }
        onAddProspect({ companyName, contactPerson, email, phone });
        // Reset form
        setCompanyName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
    };

    const longlist = prospects.filter(p => p.status === 'longlist');
    const shortlist = prospects.filter(p => p.status === 'shortlist' || p.status === 'offer-sent');

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-4 text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Neuen Interessenten erfassen</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <input type="text" placeholder="Firmenname*" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    <input type="text" placeholder="Ansprechpartner*" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    <input type="tel" placeholder="Telefon" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    <button type="submit" className="md:col-span-2 w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">
                        Interessent hinzufügen
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Longlist */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-sky-800 dark:text-sky-300">Longlist ({longlist.length})</h3>
                    <div className="space-y-4">
                        {longlist.length > 0 ? longlist.map(p => 
                            <ProspectCard key={p.id} prospect={p} onUpdateStatus={onUpdateProspectStatus} onConvertToCustomer={onConvertToCustomer} onNavigate={onNavigate} />
                        ) : <p className="text-center text-slate-500 py-4">Keine Interessenten in der Longlist.</p>}
                    </div>
                </div>

                {/* Shortlist */}
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold text-sky-800 dark:text-sky-300">Shortlist ({shortlist.length})</h3>
                    <div className="space-y-4">
                        {shortlist.length > 0 ? shortlist.map(p => 
                            <ProspectCard key={p.id} prospect={p} onUpdateStatus={onUpdateProspectStatus} onConvertToCustomer={onConvertToCustomer} onNavigate={onNavigate} />
                        ) : <p className="text-center text-slate-500 py-4">Keine Interessenten in der Shortlist.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcquisitionPage;