export interface PriceAdjustment {
    id: string;
    date: string;
    description: string;
    fileDataUrl: string;
}

export interface Contract {
    id:string;
    customerId: string;
    title: string;
    date: string; // The date the contract was signed/added to the system
    fileDataUrl?: string; // Original contract document
    startDate: string; // The date the contract term begins
    durationMonths: number;
    noticePeriodMonths: number;
    autoRenews: boolean;
    cancellationDate?: string;
    priceAdjustments: PriceAdjustment[];
}

export const contracts: Contract[] = [
    {
        id: 'contract_01',
        customerId: 'cust_01',
        title: 'Rahmenvertrag Gebäudereinigung 2024',
        date: '2024-01-15',
        startDate: '2024-02-01',
        durationMonths: 12,
        noticePeriodMonths: 1,
        autoRenews: true,
        priceAdjustments: [],
    },
    {
        id: 'contract_02',
        customerId: 'cust_02',
        title: 'Vertrag Baureinigung Projekt A',
        date: '2024-05-20',
        startDate: '2024-06-01',
        durationMonths: 6,
        noticePeriodMonths: 1,
        autoRenews: false,
        priceAdjustments: [],
    },
    {
        id: 'contract_03',
        customerId: 'cust_02',
        title: 'Zusatzvereinbarung Glasreinigung',
        date: '2024-06-01',
        startDate: '2024-06-01',
        durationMonths: 24,
        noticePeriodMonths: 3,
        autoRenews: true,
        priceAdjustments: [],
    },
];
