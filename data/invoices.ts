export interface InvoiceItem {
    description: string;
    price: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    protocolId?: string; // Link to the acceptance protocol
    date: string;
    amount: number; // Gross amount
    status: 'Bezahlt' | 'Offen';
    items: InvoiceItem[];
}

export const invoices: Invoice[] = [
    {
        id: "inv_01",
        invoiceNumber: "RE-2024-001",
        customerId: "cust_01",
        protocolId: "ap_01",
        date: "2024-07-16",
        amount: 297.50, // Example gross amount
        status: "Bezahlt",
        items: [
            { description: "Aussenreinigung Schaufenster und Eingangstüren (4h)", price: 220.00 },
            { description: "Reinigung von normalem Fensterglas beidseitig mit Rahmen (Pauschale)", price: 30.00 },
        ]
    },
    {
        id: "inv_02",
        invoiceNumber: "RE-2024-002",
        customerId: "cust_01",
        protocolId: "ap_02",
        date: "2024-06-16",
        amount: 381.39, // Example gross amount
        status: "Bezahlt",
        items: [
            { description: "Tische Abwischen mit wegräumen und zurückstellen", price: 150.00},
            { description: "Staubsaugen von glatten Bodenbelägen", price: 170.90},
        ]
    },
    {
        id: "inv_03",
        invoiceNumber: "RE-2024-003",
        customerId: "cust_02",
        protocolId: "ap_03",
        date: "2024-07-11",
        amount: 1428.00, // Example gross amount
        status: "Offen",
        items: [
             { description: "Allgemeine Baureinigungsarbeiten (20h)", price: 970.00 },
             { description: "Entsorgen von Müll (8h)", price: 388.00 },
        ]
    },
    {
        id: "inv_04",
        invoiceNumber: "RE-2024-004",
        customerId: "cust_03",
        protocolId: "ap_04",
        date: "2024-07-19",
        amount: 96.10, // Example gross amount
        status: "Bezahlt",
        items: [
            { description: "Innenreinigung Schaufenster und Eingangtüren", price: 80.75 },
        ]
    },
    {
        id: "inv_05",
        invoiceNumber: "RE-2024-005",
        customerId: "cust_04",
        protocolId: "ap_05",
        date: "2024-07-02",
        amount: 178.50, // Example gross amount
        status: "Offen",
        items: [
             { description: "Nachwischen von glatten Bodenbelägen manuell (5h)", price: 260.00 },
             { description: "Abwischen von Oberflächen Schränke, Ablagen, Türen, Türstöcke (5h)", price: 260.00 },
        ]
    },
    {
        id: "inv_06",
        invoiceNumber: "RE-2024-006",
        customerId: "cust_02",
        protocolId: "ap_06",
        date: "2024-06-11",
        amount: 1130.50, // Example gross amount
        status: "Bezahlt",
        items: [
            { description: "Kehren (10h)", price: 485.00 },
            { description: "Saugen (10h)", price: 485.00 },
        ]
    }
];
