export interface ServiceItem {
    id: string;
    name: string;
    subItems?: ServiceItem[];
    isCustom?: boolean;
}

export interface ServiceCategory {
    id: string;
    name: string;
    items: ServiceItem[];
}

export const serviceData: ServiceCategory[] = [
    {
        id: "glasreinigung",
        name: "1.0 Glasreinigung",
        items: [
            { id: "1.1", name: "Aussenreinigung Schaufenster und Eingangstüren" },
            { id: "1.2", name: "Innenreinigung Schaufenster und Eingangtüren" },
            { id: "1.3", name: "Reinigung von Zwischentüren" },
            { id: "1.4", name: "Reinigung von normalem Fensterglas beidseitig ohne Rahmen" },
            { id: "1.5", name: "Reinigung von normalem Fensterglas beidseitig mit Rahmen" },
            { id: "1.6", name: "Reinigung von Trennwänden Schaukästen und Spiegelflächen" },
            { id: "1.7", name: "Reinigung von Glasflächen im Mitarbeiter und Sozialbereich" },
            { id: "1.8", name: "Sonstiges", isCustom: true },
        ],
    },
    {
        id: "unterhaltsreinigung",
        name: "2.0 Unterhaltsreinigung",
        items: [
            { 
                id: "2.1", 
                name: "Unterhaltsreinigung von Büroflächen",
                subItems: [
                    { id: "2.1.1", name: "Tische Abwischen mit wegräumen und zurückstellen" },
                    { id: "2.1.2", name: "Abwischen von Oberflächen Schränke, Ablagen, Türen, Türstöcke" },
                    { id: "2.1.3", name: "Staubsaugen von Textilen Bodenbelägen" },
                    { id: "2.1.4", name: "Staubsaugen von glatten Bodenbelägen" },
                    { id: "2.1.5", name: "Nachwischen von glatten Bodenbelägen manuell" },
                    { id: "2.1.6", name: "Scheuersaugen von glatten Bodenbelägen maschinell" },
                    { id: "2.1.7", name: "Einpflegen mit Wischpflege" },
                    { id: "2.1.8", name: "Sonstiges", isCustom: true },
                ]
            },
        ],
    },
    {
        id: "baureinigung",
        name: "3.0 Baureinigung",
        items: [
            { id: "3.1", name: "Allgemeine Baureinigungsarbeiten" },
            { id: "3.2", name: "Kehren" },
            { id: "3.3", name: "Saugen" },
            { id: "3.4", name: "Wischen" },
            { id: "3.5", name: "Aufsammeln von groben verunreinigungen" },
            { id: "3.6", name: "Entsorgen von Müll" },
            { id: "3.7", name: "Vorreinigung von Fenstern und Rahmen mit Falz" },
            { id: "3.8", name: "Reinigung von Sanitärräumen" },
            { id: "3.9", name: "Feinreinigung von Fensterflächen mit Rahmen" },
        ],
    },
];