import React, { useMemo } from 'react';
import { Invoice } from '../data/invoices';
import { CurrencyEuroIcon } from './icons';

interface InvoiceStatusSummaryProps {
    invoices: Invoice[];
}

export const InvoiceStatusSummary: React.FC<InvoiceStatusSummaryProps> = ({ invoices }) => {
    const summary = useMemo(() => {
        let totalOpen = 0;
        let totalPaid = 0;

        invoices.forEach(invoice => {
            if (invoice.status === 'Offen') {
                totalOpen += invoice.amount;
            } else {
                totalPaid += invoice.amount;
            }
        });

        const totalAmount = totalOpen + totalPaid;
        const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

        return { totalOpen, totalPaid, paidPercentage };
    }, [invoices]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg h-full border border-transparent dark:border-slate-700/50 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                    <CurrencyEuroIcon className="w-6 h-6 mr-2 text-green-500"/>
                    Rechnungsstatus
                </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(summary.totalOpen)}</span> offen / <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(summary.totalPaid)}</span> bezahlt
                </p>
            </div>
            
            <div className="space-y-2">
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                    <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${summary.paidPercentage}%` }}
                    ></div>
                </div>
                 <p className="text-right text-sm text-slate-500 dark:text-slate-400">
                    <strong>{summary.paidPercentage.toFixed(1)}%</strong> bezahlt
                </p>
            </div>
        </div>
    );
};