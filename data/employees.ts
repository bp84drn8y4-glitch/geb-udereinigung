
import { Page } from "../App";

export interface Location {
    latitude: number;
    longitude: number;
}

export interface WorkSession {
    id: string;
    customerId: string;
    startTime: number;
    endTime: number;
    duration: number;
    breakDurationMs: number;
    adjustedBreakDurationMs?: number;
    startLocation?: Location;
    endLocation?: Location;
}

export interface Employee {
    id: string;
    name: string;
    username: string;
    password: string; // In a real app, this should be hashed.
    assignedCustomerIds: string[];
    workSessions: WorkSession[];
    permissions: Page[];
    jobFunction?: string;
    hourlyRate?: number;
    // Payroll master data
    socialSecurityNumber?: string;
    healthInsurance?: string;
    healthInsuranceNumber?: string;
    confession?: 'RK' | 'EV' | 'none'; // Römisch-katholisch, Evangelisch, Ohne Konfession
    iban?: string;
    bic?: string;
}

export const employees: Employee[] = [
    {
        id: 'emp_01',
        name: 'Gerald Hauser',
        username: 'ghauser',
        password: 'password123',
        assignedCustomerIds: ['cust_01', 'cust_04'],
        workSessions: [
            {
                id: 'ws_sample_1',
                customerId: 'cust_01',
                startTime: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
                endTime: Date.now() - (16 * 60 * 60 * 1000),   // Yesterday + 8 hours
                duration: 8 * 60 * 60 * 1000,
                breakDurationMs: 30 * 60 * 1000,
                startLocation: { latitude: 48.1351, longitude: 11.5820 }, // Munich
                endLocation: { latitude: 48.1371, longitude: 11.5830 }   // Munich nearby
            }
        ],
        permissions: ['employee-dashboard', 'acceptance-form', 'material-order', 'timesheet'],
        jobFunction: 'Meister der Gebäudereinigung',
        hourlyRate: 20.00,
        socialSecurityNumber: '12345678A987',
        healthInsurance: 'AOK Bayern',
        healthInsuranceNumber: 'A123456789',
        confession: 'RK',
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
    },
    {
        id: 'emp_02',
        name: 'Andrea Keilwerth',
        username: 'akeilwerth',
        password: 'password123',
        assignedCustomerIds: ['cust_01', 'cust_04'],
        workSessions: [],
        permissions: ['employee-dashboard', 'acceptance-form', 'material-order', 'timesheet'],
        jobFunction: 'Reinigungskraft',
        hourlyRate: 13.50,
        socialSecurityNumber: '',
        healthInsurance: '',
        healthInsuranceNumber: '',
        confession: 'none',
        iban: '',
        bic: '',
    },
    {
        id: 'emp_03',
        name: 'Abi Shala',
        username: 'ashala',
        password: 'password123',
        assignedCustomerIds: ['cust_02', 'cust_03'],
        workSessions: [],
        permissions: ['employee-dashboard', 'acceptance-form', 'material-order', 'timesheet'],
        jobFunction: 'Glasreiniger',
        hourlyRate: 16.70,
        socialSecurityNumber: '',
        healthInsurance: '',
        healthInsuranceNumber: '',
        confession: 'none',
        iban: '',
        bic: '',
    },
    {
        id: 'emp_04',
        name: 'Besire',
        username: 'besire',
        password: 'password123',
        assignedCustomerIds: ['cust_02', 'cust_03'],
        workSessions: [],
        permissions: ['employee-dashboard', 'acceptance-form', 'material-order', 'timesheet'],
        jobFunction: 'Reinigungskraft',
        hourlyRate: 13.50,
        socialSecurityNumber: '',
        healthInsurance: '',
        healthInsuranceNumber: '',
        confession: 'none',
        iban: '',
        bic: '',
    },
];
