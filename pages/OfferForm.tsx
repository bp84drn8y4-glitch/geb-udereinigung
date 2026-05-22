import React, { useState, useMemo } from 'react';
import { Prospect } from '../data/prospects';
import { NewOfferData } from '../App';
import { serviceData } from '../data/services';
import { PerformanceUnit } from '../data/customers';
import { OfferService } from '../data/offers';
import { DocumentPlusIcon, PlusIcon, TrashIcon } from '../components/icons';

const VAT_RATE = 0.19;

interface OfferFormProps {
    prospect: Prospect;
    onAddOffer: (offer: NewOfferData) => void;
    onCancel: () => void;
}

const allServicesFlat = serviceData.flatMap(cat => 
    cat.items.flatMap(item => (item.subItems ? [item, ...item.subItems] : [item]))
);

const OfferForm: React.FC<OfferFormProps> = ({ prospect, onAddOffer, onCancel }) => {
    
    const [offerItems, setOfferItems] = useState<OfferService[]>([]);
    
    // Form state for adding a new service item
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [unit, setUnit] = useState<PerformanceUnit>('hours');
    const [value, setValue] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');

    // Form state for adding additional costs
    const [costType, setCostType] = useState<'Anfahrt/Abfahrt' | 'Materialkosten' | 'Maschinenkosten'>('Anfahrt/Abfahrt');
    const [costDescription, setCostDescription] = useState('');
    const [costPrice, setCostPrice] = useState('');


    const handleAddServiceItem = () => {
        const service = allServicesFlat.find(s => s.id === selectedServiceId);
        const numericValue = parseFloat(value);
        const numericPrice = parseFloat(pricePerUnit);

        if (!service || isNaN(numericValue) || numericValue <= 0 || isNaN(numericPrice) || numericPrice < 0) {
            alert("Bitte alle Felder für den Leistungsposten korrekt ausfüllen.");
            return;
        }

        let details = "";
        if (unit === 'hours') {
            details = `${numericValue.toLocaleString('de-DE')}h à ${numericPrice.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;
        } else {
             details = `${numericValue.toLocaleString('de-DE')}m² à ${numericPrice.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}/m²`;
        }

        const newItem: OfferService = {
            id: `item_${Date.now()}`,
            serviceName: service.name,
            details,
            total: numericValue * numericPrice,
        };
        
        setOfferItems(prev => [...prev, newItem]);
        
        // Reset form
        setSelectedServiceId('');
        setUnit('hours');
        setValue('');
        setPricePerUnit('');
    };
    
    const handleAddCostItem = () => {
        const numericPrice = parseFloat(costPrice);
        if (!costDescription || isNaN(numericPrice) || numericPrice <= 0) {
            alert("Bitte Beschreibung und einen gültigen Preis für die Kosten eingeben.");
            return;
        }

        const newItem: OfferService = {
            id: `cost_${Date.now()}`,
            serviceName: costType,
            details: costDescription,
            total: numericPrice,
        };

        setOfferItems(prev => [...prev, newItem]);

        // Reset form
        setCostType('Anfahrt/Abfahrt');
        setCostDescription('');
        setCostPrice('');
    };


    const handleRemoveItem = (id: string) => {
        setOfferItems(prev => prev.filter(item => item.id !== id));
    };
    
    const totals = useMemo(() => {
        const totalNet = offerItems.reduce((sum, item) => sum + item.total, 0);
        const vat = totalNet * VAT_RATE;
        const totalGross = totalNet + vat;
        return { totalNet, vat, totalGross };
    }, [offerItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (offerItems.length === 0) {
            alert("Das Angebot enthält keine Posten und kann nicht erstellt werden.");
            return;
        }

        onAddOffer({
            prospectId: prospect.id,
            date: new Date().toISOString().split('T')[0],
            services: offerItems,
            totalNet: totals.totalNet,
            vat: totals.vat,
            totalGross: totals.totalGross,
            status: 'sent',
        });
    };
    
    const renderPrice = (price: number) => price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div>
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Neues Angebot erstellen</h2>
                <p className="text-slate-500 dark:text-slate-400">Für Interessent: {prospect.companyName} ({prospect.contactPerson})</p>
            </div>

            {/* Offer Items Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Angebotsposten</h3>
                 {offerItems.length > 0 ? (
                    <ul className="space-y-2">
                        {offerItems.map((item) => (
                            <li key={item.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{item.serviceName}</p>
                                    <p className="text-xs text-slate-500">{item.details}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">{renderPrice(item.total)}</span>
                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-center text-slate-500 py-4">Noch keine Posten zum Angebot hinzugefügt.</p>
                )}
                 <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leistung</label><select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"><option value="">Bitte auswählen</option>{serviceData.map(category => (<optgroup key={category.id} label={category.name}>{category.items.map(item => (<><option key={item.id} value={item.id}>{item.name}</option>{item.subItems && item.subItems.map(subItem => (<option key={subItem.id} value={subItem.id}>&nbsp;&nbsp;&nbsp;{subItem.name}</option>))}</>))}</optgroup>))}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Einheit</label><select value={unit} onChange={e => setUnit(e.target.value as PerformanceUnit)} className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"><option value="hours">Stunden</option><option value="sqm_price">Preis / m²</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Menge / Anzahl</label><input type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} placeholder="z.B. 10" className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" /></div>
                    <div className="flex items-end gap-2"><div className="flex-grow"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Einzelpreis (€)</label><input type="number" step="0.01" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} placeholder="z.B. 55.00" className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" /></div><button type="button" onClick={handleAddServiceItem} className="h-10 px-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition-colors"><PlusIcon className="w-5 h-5"/></button></div>
                 </div>
            </div>
            
            {/* Additional Costs Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Zusätzliche Kosten</h3>
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kostenart</label>
                        <select value={costType} onChange={e => setCostType(e.target.value as any)} className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                            <option value="Anfahrt/Abfahrt">Anfahrt/Abfahrt</option>
                            <option value="Materialkosten">Materialkosten</option>
                            <option value="Maschinenkosten">Maschinenkosten</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Beschreibung</label>
                        <input type="text" value={costDescription} onChange={e => setCostDescription(e.target.value)} placeholder="z.B. Pauschale Zone 1" className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preis (€)</label>
                            <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="z.B. 25.00" className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        <button type="button" onClick={handleAddCostItem} className="h-10 px-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition-colors">
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>


            {/* Totals Section */}
            {offerItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold pb-2">Zusammenfassung</h3>
                    <div className="flex justify-between font-semibold"><p>Gesamt Netto</p> <p>{renderPrice(totals.totalNet)}</p></div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400"><p>MwSt. ({(VAT_RATE * 100).toFixed(0)}%)</p> <p>{renderPrice(totals.vat)}</p></div>
                    <div className="flex justify-between font-bold text-2xl text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-300 dark:border-slate-600"><p>Gesamt Brutto</p> <p>{renderPrice(totals.totalGross)}</p></div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">Abbrechen</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300">
                    <DocumentPlusIcon className="w-5 h-5"/>
                    Angebot erstellen & senden
                </button>
            </div>

        </form>
    );
};

export default OfferForm;