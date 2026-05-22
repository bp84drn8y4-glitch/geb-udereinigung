export interface Message {
    id: string;
    employeeId: string;
    sender: 'Administrator';
    content: string;
    timestamp: number;
    isRead: boolean;
}

export const messages: Message[] = [];
