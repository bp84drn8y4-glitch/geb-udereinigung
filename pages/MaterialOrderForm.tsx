import React, { useState, useRef, useMemo } from 'react';
import { Employee } from '../data/employees';
import { NewMaterialOrderData } from '../App';
import { MaterialOrder, OrderItem, ReturnItem } from '../data/materialOrders';
import { materialCategories, returnableTextiles } from '../data/materialData';
import SignatureCanvas from '../components/SignatureCanvas';
import { PlusIcon, TrashIcon, CubeIcon } from '../components/icons';

interface MaterialOrderFormProps {
    employee: Employee;
    orderHistory: MaterialOrder[];
    onAddOrder: (order: NewMaterialOrderData) => void;
    onCancel: () => void;
}

const MaterialOrderForm: React.FC<MaterialOrderFormProps> = ({ employee, orderHistory, onAddOrder, onCancel }) => {
    const signatureRef = useRef<{ clear: () => void; getSignature: () => string | null }>(null);

    const employeeOrderHistory = useMemo(() => 
        orderHistory.filter(o => o.employeeId === employee.id),
    [orderHistory, employee.id]);

    const initialOrderQuantities = useMemo(() => {
        const quantities: Record<string, { quantity: number, unit: string, details: string }> = {};
        employeeOrderHistory.forEach(order => {
            order.items.forEach(item => {
                const key = `${item.name}-${item.details || ''}`;
                quantities[key] = {
                    quantity: (quantities[key]?.quantity || 0) + item.quantity,
                    unit: item.unit || 'Stück',
                    details: item.details || ''
                };
            });
        });
        return quantities;
    }, [employeeOrderHistory]);

    const initialReturnQuantities = useMemo(() => {
        const quantities: Record<string, number> = {};
        employeeOrderHistory.forEach(order => {
            order.returns?.forEach(item => {
                const key = `${item.name}-${item.details || ''}`;
                quantities[key] = (quantities[key] || 0) + item.quantity;
            });
        });
        return quantities;
    }, [employeeOrderHistory]);


    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [returnItems, setReturnItems] = useState<Record<string, number>>(
        returnableTextiles.reduce((acc, textile) => {
            const key = `${textile.name}-${textile.details || ''}`;
            acc[textile.id] = initialReturnQuantities[key] || 0;
            return acc;
        }, {} as Record<string, number>)
    );

    const handleAddOrderItem = (name: string, quantity: number, unit = 'Stück', details = '') => {
        if (!name || isNaN(quantity) || quantity <= 0) {
            alert("Bitte Artikel und eine gültige Menge angeben.");
            return;
        }
        
        const newItem: OrderItem = {
            id: `item_${Date.now()}_${name}`,
            name,
            quantity,
            unit,
            details,
        };
        setOrderItems(prev => [...prev, newItem]);
    };

    const handleRemoveOrderItem = (id: string) => {
        setOrderItems(prev => prev.filter(item => item.id !== id));
    };

    const handleReturnQuantityChange = (id: string, quantity: number) => {
        setReturnItems(prev => ({
            ...prev,
            [id]: quantity,
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const signature = signatureRef.current?.getSignature();
        if (!signature) {
            alert("Bitte unterschreiben Sie, um die Bestellung und Rückgabe zu bestätigen.");
            return;
        }

        const finalReturnItems: ReturnItem[] = returnableTextiles
            .map(textile => ({
                id: textile.id,
                name: textile.name,
                details: textile.details,
                quantity: returnItems[textile.id] || 0,
            }))
            .filter(item => item.quantity > 0);
        
        if (orderItems.length === 0 && finalReturnItems.length === 0) {
            alert("Es wurde nichts bestellt oder zurückgegeben.");
            return;
        }

        onAddOrder({
            employeeId: employee.id,
            date: new Date().toISOString().split('T')[0],
            items: orderItems,
            returns: finalReturnItems,
            status: 'pending',
            signature: signature,
        });
    };

    const renderOrderFormSection = (category: typeof materialCategories[0]) => {
        const [selectedItemName, setSelectedItemName] = useState('');
        const [quantity, setQuantity] = useState('');
        const [unit, setUnit] = useState('Stück');
        const [details, setDetails] = useState('');
        const [otherName, setOtherName] = useState('');

        const selectedItem = category.items.find(i => i.name === selectedItemName);

        const handleAdd = () => {
            const finalName = selectedItemName === 'Sonstiges' ? otherName : selectedItemName;
            const finalDetails = selectedItem?.options ? details : '';
            handleAddOrderItem(finalName, parseInt(quantity, 10), unit, finalDetails);
            // Reset local form state
            setSelectedItemName('');
            setQuantity('');
            setUnit('Stück');
            setDetails('');
            setOtherName('');
        };

        return (
            <details key={category.name} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700" open>
                <summary className="font-bold text-lg cursor-pointer text-sky-800 dark:text-sky-300">{category.name}</summary>
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Artikel</label>
                        <select value={selectedItemName} onChange={e => setSelectedItemName(e.target.value)} className="w-full p-2 mt-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                            <option value="">Auswählen...</option>
                            {category.items.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
                        </select>
                    </div>
                    {selectedItemName === 'Sonstiges' && (
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium">Bezeichnung</label>
                             <input type="text" value={otherName} onChange={e => setOtherName(e.target.value)} className="w-full p-2 mt-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                        </div>
                    )}
                    {selectedItem?.options && (
                         <div>
                            <label className="block text-sm font-medium">Größe/Art</label>
                            <select value={details} onChange={e => setDetails(e.target.value)} className="w-full p-2 mt-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                                <option value="">Auswählen...</option>
                                {selectedItem.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium">Menge</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-2 mt-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                    </div>
                     {selectedItem?.requiresUnit && (
                        <div>
                             <label className="block text-sm font-medium">Einheit</label>
                             <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-2 mt-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"/>
                        </div>
                    )}
                    <button type="button" onClick={handleAdd} className="h-10 px-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition-colors flex items-center justify-center gap-2"><PlusIcon className="w-5 h-5"/> Hinzufügen</button>
                </div>
            </details>
        );
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-700 pb-4">Materialbestellung & -rückgabe</h2>

            {/* Order Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">1. Material bestellen</h3>
                {materialCategories.map(renderOrderFormSection)}
            </div>

            {/* Return Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">2. Textil-Rückgabe (gebraucht)</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    {returnableTextiles.map(textile => {
                        const key = `${textile.name}-${textile.details || ''}`;
                        const historicalQty = initialReturnQuantities[key] || 0;
                        return (
                            <div key={textile.id} className="grid grid-cols-3 items-center gap-4">
                                <label htmlFor={textile.id} className="col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {textile.name} {textile.details && `(${textile.details})`}
                                    <span className="text-xs text-slate-400 block">Bisher zurückgegeben: {historicalQty}</span>
                                </label>
                                <input 
                                    type="number"
                                    id={textile.id}
                                    value={returnItems[textile.id] || ''}
                                    onChange={e => handleReturnQuantityChange(textile.id, parseInt(e.target.value, 10) || 0)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full p-2 text-center bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Summary Section */}
            {(orderItems.length > 0) && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Bestellübersicht</h3>
                    <ul className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        {orderItems.map(item => (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                                <span>{item.quantity} {item.unit} {item.name} {item.details && `(${item.details})`}</span>
                                <button type="button" onClick={() => handleRemoveOrderItem(item.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             
            {/* Signature Section */}
            <div>
                 <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">3. Unterschrift</h3>
                 <p className="text-sm text-slate-500 mb-2">Bitte bestätigen Sie Ihre Bestellung und Rückgabe mit Ihrer Unterschrift.</p>
                 <SignatureCanvas ref={signatureRef} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">Abbrechen</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300">
                    <CubeIcon className="w-5 h-5"/>
                    Bestellung abschicken
                </button>
            </div>
        </form>
    );
};

export default MaterialOrderForm;