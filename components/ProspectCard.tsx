import React from 'react';
import { Prospect } from '../data/prospects';
import { ArrowRightCircleIcon, CheckCircleIcon, XCircleIcon, UserPlusIcon, ArrowUturnLeftIcon, DocumentPlusIcon, DocumentTextIcon } from './icons';
import { Page } from '../App';

interface ProspectCardProps {
    prospect: Prospect;
    onUpdateStatus: (id: string, newStatus: Prospect['status']) => void;
    onConvertToCustomer: (prospect: Prospect) => void;
    onNavigate: (page: Page, customerId?: string, protocolId?: string, prospectId?: string) => void;
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onUpdateStatus, onConvertToCustomer, onNavigate }) => {
    
    const renderActions = () => {
        switch(prospect.status) {
            case 'longlist':
                return (
                    <>
                        <button onClick={() => onUpdateStatus(prospect.id, 'shortlist')} className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-400 hover:underline font-semibold">
                            <ArrowRightCircleIcon className="w-5 h-5"/>
                            Zur Shortlist
                        </button>
                        <button onClick={() => onUpdateStatus(prospect.id, 'rejected')} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                            <XCircleIcon className="w-5 h-5"/>
                            Ablehnen
                        </button>
                    </>
                );
            case 'shortlist':
                 return (
                    <>
                        <button onClick={() => onNavigate('offer-form', undefined, undefined, prospect.id)} className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-400 hover:underline font-semibold">
                            <DocumentPlusIcon className="w-5 h-5"/>
                            Angebot erstellen
                        </button>
                        <button onClick={() => onUpdateStatus(prospect.id, 'rejected')} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                            <XCircleIcon className="w-5 h-5"/>
                            Ablehnen
                        </button>
                    </>
                );
            case 'offer-sent':
                return (
                    <>
                        <button onClick={() => onConvertToCustomer(prospect)} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline font-semibold">
                            <UserPlusIcon className="w-5 h-5"/>
                            Als Kunde gewinnen
                        </button>
                        <button onClick={() => onUpdateStatus(prospect.id, 'rejected')} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                            <XCircleIcon className="w-5 h-5"/>
                            Abgelehnt
                        </button>
                    </>
                );
            case 'rejected':
                 return (
                    <button onClick={() => onUpdateStatus(prospect.id, 'longlist')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:underline">
                        <ArrowUturnLeftIcon className="w-5 h-5"/>
                        Reaktivieren
                    </button>
                 );
             case 'customer':
                 return (
                    <p className="flex items-center gap-2 text-sm text-green-500 font-semibold">
                        <CheckCircleIcon className="w-5 h-5"/>
                        Kunde
                    </p>
                 );
            default:
                return null;
        }
    }

    const getStatusIndicator = () => {
        if (prospect.status === 'offer-sent') {
            return (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded-full">
                    <DocumentTextIcon className="w-3 h-3"/>
                    <span>Angebot gesendet</span>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="relative bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
            {getStatusIndicator()}
            <div>
                <h4 className="font-bold text-sky-800 dark:text-sky-300">{prospect.companyName}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{prospect.contactPerson}</p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
                <p>{prospect.email}</p>
                <p>{prospect.phone}</p>
            </div>
            <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                {renderActions()}
            </div>
        </div>
    );
};