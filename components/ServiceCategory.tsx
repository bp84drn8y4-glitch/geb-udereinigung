import React from 'react';
import { ServiceCategory as ServiceCategoryType, ServiceItem } from '../data/services';

interface ServiceCategoryProps {
    category: ServiceCategoryType;
    serviceStates: Record<string, boolean>; // boolean now represents isFulfilled
    customServiceTexts: Record<string, string>;
    onServiceChange: (id: string, checked: boolean, type: 'item' | 'category') => void;
    onCustomTextChange: (id: string, text: string) => void;
}

const ServiceItemComponent: React.FC<{
    item: ServiceItem;
    serviceStates: Record<string, boolean>;
    customServiceTexts: Record<string, string>;
    onServiceChange: (id: string, checked: boolean, type: 'item' | 'category') => void;
    onCustomTextChange: (id: string, text: string) => void;
    level: number;
}> = ({ item, serviceStates, customServiceTexts, onServiceChange, onCustomTextChange, level }) => {
    const isFulfilled = !!serviceStates[item.id];

    return (
        <div style={{ marginLeft: `${level * 20}px` }} className="my-2">
            <div className={`flex items-center justify-between gap-2 py-1 ${item.subItems ? 'font-semibold' : ''}`}>
                <span className="flex-grow">{item.name}</span>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <label htmlFor={`${item.id}-fulfilled`} className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input 
                            type="checkbox" 
                            id={`${item.id}-fulfilled`} 
                            checked={isFulfilled}
                            onChange={(e) => onServiceChange(item.id, e.target.checked, 'item')}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        Erbracht
                    </label>
                </div>
            </div>
             {item.isCustom && isFulfilled && (
                 <input 
                    type="text" 
                    placeholder="Details eingeben"
                    value={customServiceTexts[item.id] || ''}
                    onChange={(e) => onCustomTextChange(item.id, e.target.value)}
                    className="w-full p-2 mt-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                />
            )}
            {item.subItems && (
                <div>
                    {item.subItems.map(subItem => (
                        <ServiceItemComponent 
                            key={subItem.id} 
                            item={subItem} 
                            serviceStates={serviceStates}
                            customServiceTexts={customServiceTexts}
                            onServiceChange={onServiceChange}
                            onCustomTextChange={onCustomTextChange}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const ServiceCategory: React.FC<ServiceCategoryProps> = ({ category, serviceStates, onServiceChange, customServiceTexts, onCustomTextChange }) => {
    const allItemsRecursive = (items: ServiceItem[]): ServiceItem[] => {
        return items.flatMap(item => item.subItems ? [item, ...allItemsRecursive(item.subItems)] : [item]);
    }
    const allItems = allItemsRecursive(category.items);
    const checkableItems = allItems.filter(item => !item.isCustom);
    const isAllChecked = checkableItems.length > 0 && checkableItems.every(item => !!serviceStates[item.id]);

    return (
        <details className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700" open>
            <summary className="font-bold text-lg cursor-pointer text-slate-700 dark:text-slate-200 flex items-center gap-3">
                 <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={(e) => onServiceChange(category.id, e.target.checked, 'category')}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    aria-label={`Select all for ${category.name}`}
                />
                {category.name}
            </summary>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-2">
                {category.items.map(item => (
                    <ServiceItemComponent 
                        key={item.id}
                        item={item}
                        serviceStates={serviceStates}
                        onServiceChange={onServiceChange}
                        customServiceTexts={customServiceTexts}
                        onCustomTextChange={onCustomTextChange}
                        level={0}
                    />
                ))}
            </div>
        </details>
    );
};

export default ServiceCategory;