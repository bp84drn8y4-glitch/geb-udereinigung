export interface MaterialItem {
    name: string;
    requiresUnit?: boolean;
    options?: string[];
}

export interface MaterialCategory {
    name: string;
    items: MaterialItem[];
}

export const materialCategories: MaterialCategory[] = [
    {
        name: "Reinigungsmittel",
        items: [
            { name: "Torvan", requiresUnit: true },
            { name: "Milizid", requiresUnit: true },
            { name: "Neutralreiniger", requiresUnit: true },
            { name: "Glasreiniger", requiresUnit: true },
            { name: "Oberflächenreiniger", requiresUnit: true },
            { name: "Sonstiges", requiresUnit: true },
        ],
    },
    {
        name: "Reinigungstextilien",
        items: [
            { name: "Mikrofasermops", options: ["40cm", "50cm"] },
            { name: "Baumwollmops", options: ["40cm", "50cm"] },
            { name: "Mikrofasertücher rot Sanitär" },
            { name: "Mikrofasertücher Blau Oberflächen" },
            { name: "Mikrofasertücher gelb Küche" },
            { name: "Mikrofasertücher Grün Boden" },
            { name: "Sonstiges" },
        ],
    },
    {
        name: "Verbrauchsmaterial",
        items: [
            { name: "Toilettenpapier 3 Lagig" },
            { name: "Toilettenpapier 2 Lagig" },
            { name: "Papierhandtücher Z-Faltung Weiss" },
            { name: "Papierhandtücher Z-Faltung braun" },
            { name: "Papierhandtücher z-Faltung Nachhaltig grün" },
            { name: "Handwaschseife 150ml" },
            { name: "Sonstiges" },
        ],
    },
];

export const returnableTextiles = [
    { id: 'ret-mop-micro-40', name: 'Mikrofasermops', details: '40cm' },
    { id: 'ret-mop-micro-50', name: 'Mikrofasermops', details: '50cm' },
    { id: 'ret-mop-cotton-40', name: 'Baumwollmops', details: '40cm' },
    { id: 'ret-mop-cotton-50', name: 'Baumwollmops', details: '50cm' },
    { id: 'ret-tuch-red', name: 'Mikrofasertücher rot Sanitär' },
    { id: 'ret-tuch-blue', name: 'Mikrofasertücher Blau Oberflächen' },
    { id: 'ret-tuch-yellow', name: 'Mikrofasertücher gelb Küche' },
    { id: 'ret-tuch-green', name: 'Mikrofasertücher Grün Boden' },
];
