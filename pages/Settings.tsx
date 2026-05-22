import React, { useState, useRef } from 'react';
import { Employee } from '../data/employees';
import { Page } from '../App';
import { CogIcon, PlusIcon } from '../components/icons';
import { QualityQuestion } from '../data/qualityQuestions';

interface SettingsProps {
    employees: Employee[];
    permissions: Record<string, Page[]>;
    onUpdatePermissions: (employeeId: string, newPermissions: Page[]) => void;
    currentLogoUrl: string;
    onUpdateLogo: (newLogoUrl: string) => void;
    qualityQuestions: QualityQuestion[];
    onAddQualityQuestion: (questionText: string) => void;
    onToggleQualityQuestion: (questionId: string, isActive: boolean) => void;
}

const manageablePages: { id: Page, name: string }[] = [
    { id: 'customers-list', name: 'Kundenübersicht' },
    { id: 'acquisition', name: 'Neukundenaquise' },
    { id: 'employees-list', name: 'Mitarbeiterübersicht' },
    { id: 'acceptance-form', name: 'Abnahmeprotokolle' },
    { id: 'material-order', name: 'Materialbestellungen' },
];

const Settings: React.FC<SettingsProps> = ({ employees, permissions, onUpdatePermissions, currentLogoUrl, onUpdateLogo, qualityQuestions, onAddQualityQuestion, onToggleQualityQuestion }) => {
    const [tempPermissions, setTempPermissions] = useState(permissions);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [newQuestionText, setNewQuestionText] = useState('');

    const handlePermissionChange = (employeeId: string, page: Page, isChecked: boolean) => {
        setTempPermissions(prev => {
            const currentPerms = prev[employeeId] || [];
            const newPerms = isChecked
                ? [...currentPerms, page]
                : currentPerms.filter(p => p !== page);
            return { ...prev, [employeeId]: newPerms };
        });
    };

    const handleSavePermissions = (employeeId: string) => {
        onUpdatePermissions(employeeId, tempPermissions[employeeId]);
        alert(`Berechtigungen für ${employees.find(e=>e.id === employeeId)?.name} gespeichert.`);
    };

    const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Bitte wählen Sie eine JPG- oder PNG-Datei aus.");
        }
    };

    const handleLogoUpload = () => {
        if (logoPreview) {
            onUpdateLogo(logoPreview);
            alert("Logo erfolgreich aktualisiert.");
            setLogoPreview(null);
             if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleAddNewQuestion = () => {
        if (newQuestionText.trim()) {
            onAddQualityQuestion(newQuestionText);
            setNewQuestionText('');
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 text-sky-800 dark:text-sky-300">
                <CogIcon className="w-8 h-8"/>
                <h2 className="text-3xl font-bold">Einstellungen</h2>
            </div>
            
            {/* Logo Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">Logo anpassen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">Aktuelles Logo</p>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-center items-center bg-slate-50 dark:bg-slate-900/50">
                            <img src={currentLogoUrl} alt="Aktuelles Logo" className="h-20" />
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">Neues Logo hochladen (JPG, PNG)</p>
                         <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/jpeg, image/png" 
                            onChange={handleLogoSelect}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/70 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-800"
                        />
                         {logoPreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Vorschau:</p>
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-center items-center bg-slate-50 dark:bg-slate-900/50">
                                     <img src={logoPreview} alt="Vorschau" className="h-20" />
                                </div>
                                 <button onClick={handleLogoUpload} className="w-full mt-4 px-4 py-2 text-sm font-semibold bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors">
                                    Neues Logo speichern
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quality Questions Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">Qualitätsfragen verwalten</h3>
                <div className="space-y-3 mb-4">
                    {qualityQuestions.map(question => (
                        <div key={question.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <p className="text-slate-800 dark:text-slate-200">{question.text}</p>
                            <label className="flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-slate-600 dark:text-slate-400">Aktiv</span>
                                <div className="relative">
                                    <input type="checkbox" checked={question.isActive} onChange={(e) => onToggleQualityQuestion(question.id, e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-sky-600"></div>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Neue Frage hier eingeben..."
                        className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button onClick={handleAddNewQuestion} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-700 text-white rounded-lg hover:bg-sky-800">
                        <PlusIcon className="w-4 h-4" />
                        Hinzufügen
                    </button>
                </div>
            </div>

            {/* Permissions Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                 <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">Mitarbeiterberechtigungen</h3>
                 <div className="space-y-6">
                    {employees.map(employee => (
                        <div key={employee.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <h4 className="font-bold text-lg text-sky-800 dark:text-sky-300">{employee.name}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                {manageablePages.map(page => (
                                    <label key={page.id} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={(tempPermissions[employee.id] || []).includes(page.id)}
                                            onChange={(e) => handlePermissionChange(employee.id, page.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm">{page.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => handleSavePermissions(employee.id)} className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">
                                    Berechtigungen speichern
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default Settings;