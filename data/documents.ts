
export interface EmployeeDocument {
    id: string;
    employeeId: string;
    name: string;
    fileDataUrl: string; // Base64 encoded PDF
    uploadDate: string;
    category: 'contract' | 'payslip' | 'other';
    isOpened: boolean;
    isDownloaded: boolean;
}

export const documents: EmployeeDocument[] = [];
