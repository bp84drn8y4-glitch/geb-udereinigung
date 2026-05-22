export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    unit?: string;
    details?: string;
}

export interface ReturnItem {
    id: string;
    name: string;
    quantity: number;
    details?: string;
}


export interface MaterialOrder {
    id: string;
    employeeId: string;
    date: string;
    items: OrderItem[];
    returns: ReturnItem[];
    status: 'pending' | 'completed';
    signature: string;
}

export const materialOrders: MaterialOrder[] = [
    {
        id: "mo_01",
        employeeId: "emp_01",
        date: "2024-07-20",
        items: [
            { id: 'item-1', name: "Torvan", quantity: 2, unit: "Flasche" },
            { id: 'item-2', name: "Mikrofasertücher Blau Oberflächen", quantity: 10, unit: "Stück" }
        ],
        returns: [],
        status: "completed",
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
    }
];
