export type PerformanceUnit = 'hours' | 'sqm_price';

export interface MonthlyTargetService {
    serviceId: string;
    unit: PerformanceUnit;
    value: number;
}

export interface CostItem {
    id: string;
    name: string;
    type: 'travel' | 'material' | 'machine';
    price: number;
}

export interface Customer {
    id: string;
    name: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    password?: string;
    address: {
        street: string;
        zipCode: string;
        city: string;
    };
    propertySize: number; // in square meters
    hourlyRate: number; // price per hour
    monthlyTarget?: MonthlyTargetService[];
    predefinedCosts?: CostItem[];
}

export const customers: Customer[] = [
    {
        id: "cust_01",
        name: "Offgrid Tec",
        contactPerson: "Max Mustermann",
        position: "Geschäftsführer",
        phone: "0123-456789",
        email: "max.mustermann@offgrid-tec.de",
        password: "password123",
        address: {
            street: "Musterstraße 1",
            zipCode: "12345",
            city: "Musterstadt"
        },
        propertySize: 250,
        hourlyRate: 55,
        monthlyTarget: [
            { serviceId: "1.1", unit: 'hours', value: 4 },
            { serviceId: "1.5", unit: 'sqm_price', value: 1.50 }
        ],
        predefinedCosts: [
            { id: 'cost1', name: 'Anfahrt Pauschale', type: 'travel', price: 25.00 },
            { id: 'cost2', name: 'Glasreiniger Konzentrat', type: 'material', price: 15.50 },
        ]
    },
    {
        id: "cust_02",
        name: "UAI",
        contactPerson: "Erika Mustermann",
        position: "Büroleitung",
        phone: "0123-987654",
        email: "erika.mustermann@uai.de",
        password: "password123",
        address: {
            street: "Beispielweg 22",
            zipCode: "54321",
            city: "Beispielhausen"
        },
        propertySize: 1200,
        hourlyRate: 48.50,
        monthlyTarget: [
            { serviceId: "3.1", unit: 'hours', value: 20 },
            { serviceId: "3.6", unit: 'hours', value: 8 },
            { serviceId: "3.2", unit: 'hours', value: 10 },
            { serviceId: "3.3", unit: 'hours', value: 10 },
            { serviceId: "3.4", unit: 'hours', value: 10 }
        ],
        predefinedCosts: [
             { id: 'cost3', name: 'Anfahrt Pauschale (Baustelle)', type: 'travel', price: 45.00 },
             { id: 'cost4', name: 'Bauschutt Entsorgung', type: 'material', price: 150.00 },
             { id: 'cost5', name: 'Industriesauger Miete', type: 'machine', price: 75.00 },
        ]
    },
    {
        id: "cust_03",
        name: "Matt Optik",
        contactPerson: "John Doe",
        position: "Filialleiter",
        phone: "0176-11223344",
        email: "john.doe@matt-optik.de",
        password: "password123",
        address: {
            street: "Hauptplatz 5",
            zipCode: "67890",
            city: "Testingen"
        },
        propertySize: 150,
        hourlyRate: 60,
        monthlyTarget: [
            { serviceId: "1.2", unit: 'sqm_price', value: 2.0 },
            { serviceId: "1.6", unit: 'hours', value: 2 }
        ],
        predefinedCosts: []
    },
    {
        id: "cust_04",
        name: "Mister Lady",
        contactPerson: "Jane Doe",
        position: "Store Managerin",
        phone: "0176-55667788",
        email: "jane.doe@mister-lady.com",
        password: "password123",
        address: {
            street: "Shopping-Allee 1a",
            zipCode: "10115",
            city: "Berlin"
        },
        propertySize: 400,
        hourlyRate: 52,
        monthlyTarget: [
            { serviceId: "2.1.2", unit: 'hours', value: 5 },
            { serviceId: "2.1.5", unit: 'hours', value: 5 }
        ],
        predefinedCosts: [
            { id: 'cost1', name: 'Anfahrt Pauschale', type: 'travel', price: 25.00 },
        ]
    },
];