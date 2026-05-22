import React, { useState, useMemo } from 'react';
import { Customer, CostItem } from '../data/customers';
import { AcceptanceProtocol } from '../data/acceptanceProtocols';
import { NewInvoiceData } from '../App';
import { InvoiceItem } from '../data/invoices';
import { CurrencyEuroIcon, PlusIcon, TrashIcon } from '../components/icons';

const VAT_RATE = 0.19;

interface InvoiceFormProps {
    customer: Customer;
    protocol: AcceptanceProtocol;
    onAddInvoice: (invoice: NewInvoiceData) => void;
    onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ customer, protocol, onAddInvoice, onCancel }) => {
    
    const calculatedItems: InvoiceItem[] = useMemo(() => {
        const items: InvoiceItem[] = [];
        const fulfilledServices = (protocol.services || []).filter(s => s.isFulfilled);
        const hoursWorked = protocol.durationMs / (1000 * 60 * 60); // Convert ms to hours for calculation

        for (const service of fulfilledServices) {
            const targetDef = (customer.monthlyTarget || []).find(t => t.serviceId === service.serviceId);
            if (targetDef) {
                let price = 0;
                let description = service.serviceName;

                if (targetDef.unit === 'hours') {
                    // Use actual worked hours for invoicing, not the target hours
                    price = hoursWorked * customer.hourlyRate;
                    description += ` (${hoursWorked.toFixed(2)}h à ${customer.hourlyRate.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})`;
                } else if (targetDef.unit === 'sqm_price') {
                    price = targetDef.value * customer.propertySize;
                    description += ` (${customer.propertySize}m² à ${targetDef.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}/m²)`;
                }
                
                if (price > 0) {
                    items.push({ description, price });
                }
            }
        }
        return items;
    }, [customer, protocol]);

    const [additionalItems, setAdditionalItems] = useState<InvoiceItem[]>([]);
    const [selectedCostId, setSelectedCostId] = useState<string>('');
    
    const handleAddCost = () => {
        if (!selectedCostId) return;
        const costToAdd = (customer.predefinedCosts || []).find(c => c.id === selectedCostId);
        if (costToAdd) {
            setAdditionalItems(prev => [...prev, { description: costToAdd.name, price: costToAdd.price }]);
            setSelectedCostId('');
        }
    };
    
    const handleRemoveAdditionalItem = (index: number) => {
        setAdditionalItems(prev => prev.filter((_, i) => i !== index));
    };
    
    const totals = useMemo(() => {
        const netServices = calculatedItems.reduce((sum, item) => sum + item.price, 0);
        const netAdditional = additionalItems.reduce((sum, item) => sum + item.price, 0);
        const totalNet = netServices + netAdditional;
        const vat = totalNet * VAT_RATE;
        const totalGross = totalNet + vat;
        return { netServices, netAdditional, totalNet, vat, totalGross };
    }, [calculatedItems, additionalItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allItems = [...calculatedItems, ...additionalItems];
        if (allItems.length === 0) {
            alert("Die Rechnung enthält keine Posten und kann nicht erstellt werden.");
            return;
        }

        onAddInvoice({
            customerId: customer.id,
            protocolId: protocol.id,
            date: new Date().toISOString().split('T')[0],
            items: allItems,
            amount: totals.totalGross,
            status: 'Offen'
        });
    };

    const renderPrice = (price: number) => price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div>
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Neue Rechnung erstellen</h2>
                <p className="text-slate-500 dark:text-slate-400">Für Kunde: {customer.name} | Basis: Protokoll {protocol.protocolNumber}</p>
            </div>

            {/* Calculated Services Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Leistungen aus Abnahmeprotokoll</h3>
                {calculatedItems.length > 0 ? (
                    <ul className="space-y-2">
                        {calculatedItems.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <span className="text-sm">{item.description}</span>
                                <span className="font-semibold">{renderPrice(item.price)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-4">Keine abrechenbaren Leistungen im Protokoll gefunden, die im Kundenstamm definiert sind.</p>
                )}
            </div>

            {/* Additional Costs Section */}
            <div className="space-y-4">
                 <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Zusätzliche Posten</h3>
                 {additionalItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <span className="text-sm">{item.description}</span>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">{renderPrice(item.price)}</span>
                            <button type="button" onClick={() => handleRemoveAdditionalItem(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                 ))}
                 <div className="flex items-center gap-2 p-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                    <select value={selectedCostId} onChange={e => setSelectedCostId(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                        <option value="">Vordefinierte Kosten auswählen...</option>
                        {(customer.predefinedCosts || []).map(cost => <option key={cost.id} value={cost.id}>{cost.name} ({renderPrice(cost.price)})</option>)}
                    </select>
                    <button type="button" onClick={handleAddCost} disabled={!selectedCostId} className="p-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800 disabled:bg-slate-400">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                 </div>
            </div>

            {/* Totals Section */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold pb-2">Zusammenfassung</h3>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><p>Zwischensumme (Leistungen)</p> <p>{renderPrice(totals.netServices)}</p></div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><p>Zwischensumme (Zusatzkosten)</p> <p>{renderPrice(totals.netAdditional)}</p></div>
                <div className="flex justify-between font-semibold"><p>Gesamt Netto</p> <p>{renderPrice(totals.totalNet)}</p></div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400"><p>MwSt. ({(VAT_RATE * 100).toFixed(0)}%)</p> <p>{renderPrice(totals.vat)}</p></div>
                <div className="flex justify-between font-bold text-2xl text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-300 dark:border-slate-600"><p>Gesamt Brutto</p> <p>{renderPrice(totals.totalGross)}</p></div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">Abbrechen</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300">
                    <CurrencyEuroIcon className="w-5 h-5"/>
                    Rechnung erstellen
                </button>
            </div>

        </form>
    );
};

export default InvoiceForm;