
export interface JobFunction {
    name: string;
    rate: number;
}

export const jobFunctions: JobFunction[] = [
    { name: 'Reinigungskraft', rate: 13.50 },
    { name: 'Glasreiniger', rate: 16.70 },
    { name: 'Vorarbeiter', rate: 17.00 },
    { name: 'Geselle der Gebäudereinigung', rate: 16.70 },
    { name: 'Meister der Gebäudereinigung', rate: 20.00 },
    { name: 'Hilfskraft', rate: 13.50 },
    { name: 'Bürokraft', rate: 15.00 },
    { name: 'Sonstiges', rate: 0 },
];
