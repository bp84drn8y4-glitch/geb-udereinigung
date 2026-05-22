export interface ProtocolService {
    serviceId: string;
    serviceName: string;
    customText?: string;
    isTarget: boolean; // Soll
    isFulfilled: boolean; // Erfüllt
}

export type QualityRating = 'good' | 'neutral' | 'bad';

export interface Answer {
    questionId: string;
    rating: QualityRating;
}

export interface QualityFeedback {
    answers: Answer[];
    notes: string;
    requestSupervisor: boolean;
}

export interface AcceptanceProtocol {
    id: string;
    customerId: string;
    date: string;
    employees: string[];
    durationMs: number;
    services?: ProtocolService[];
    protocolNumber: string;
    status: 'Ausstehend' | 'Abgeschlossen';
    signature?: string | null;
    isLocked: boolean;
    qualityFeedback?: QualityFeedback;
}

export const acceptanceProtocols: AcceptanceProtocol[] = [
    {
        id: "ap_01",
        customerId: "cust_01",
        date: "2024-07-15",
        employees: ["Gerald Hauser"],
        durationMs: 8 * 60 * 60 * 1000,
        services: [
            { serviceId: "1.1", serviceName: "Aussenreinigung Schaufenster und Eingangstüren", isTarget: true, isFulfilled: true },
            { serviceId: "1.5", serviceName: "Reinigung von normalem Fensterglas beidseitig mit Rahmen", isTarget: true, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-07-001",
        status: 'Abgeschlossen',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // Placeholder
        isLocked: true,
        qualityFeedback: {
            answers: [
                { questionId: 'q_punctuality', rating: 'good' },
                { questionId: 'q_friendliness', rating: 'good' },
                { questionId: 'q_quality', rating: 'good' },
            ],
            notes: 'Alles super, wie immer!',
            requestSupervisor: false,
        }
    },
    {
        id: "ap_02",
        customerId: "cust_01",
        date: "2024-06-15",
        employees: ["Andrea Keilwerth"],
        durationMs: 6.5 * 60 * 60 * 1000,
        services: [
            { serviceId: "2.1.1", serviceName: "Tische Abwischen mit wegräumen und zurückstellen", isTarget: true, isFulfilled: true },
            { serviceId: "2.1.3", serviceName: "Staubsaugen von Textilen Bodenbelägen", isTarget: true, isFulfilled: false },
             { serviceId: "2.1.4", serviceName: "Staubsaugen von glatten Bodenbelägen", isTarget: false, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-06-015",
        status: 'Abgeschlossen',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // Placeholder
        isLocked: true,
        qualityFeedback: {
            answers: [
                { questionId: 'q_punctuality', rating: 'good' },
                { questionId: 'q_friendliness', rating: 'good' },
                { questionId: 'q_quality', rating: 'bad' },
            ],
            notes: 'Der Teppich im Eingangsbereich wurde leider vergessen. Bitte beim nächsten Mal darauf achten.',
            requestSupervisor: true,
        }
    },
    {
        id: "ap_03",
        customerId: "cust_02",
        date: "2024-07-10",
        employees: ["Abi Shala"],
        durationMs: 16 * 60 * 60 * 1000,
        services: [
            { serviceId: "3.1", serviceName: "Allgemeine Baureinigungsarbeiten", isTarget: true, isFulfilled: true },
            { serviceId: "3.6", serviceName: "Entsorgen von Müll", isTarget: true, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-07-002",
        status: 'Ausstehend',
        isLocked: false,
    },
    {
        id: "ap_04",
        customerId: "cust_03",
        date: "2024-07-18",
        employees: ["Besire"],
        durationMs: 4 * 60 * 60 * 1000,
        services: [
            { serviceId: "1.2", serviceName: "Innenreinigung Schaufenster und Eingangtüren", isTarget: true, isFulfilled: true },
            { serviceId: "1.6", serviceName: "Reinigung von Trennwänden Schaukästen und Spiegelflächen", isTarget: true, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-07-003",
        status: 'Abgeschlossen',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // Placeholder
        isLocked: true,
        qualityFeedback: {
             answers: [
                { questionId: 'q_punctuality', rating: 'good' },
                { questionId: 'q_friendliness', rating: 'neutral' },
                { questionId: 'q_quality', rating: 'good' },
            ],
            notes: '',
            requestSupervisor: false,
        }
    },
    {
        id: "ap_05",
        customerId: "cust_04",
        date: "2024-07-01",
        employees: ["Gerald Hauser", "Andrea Keilwerth"],
        durationMs: 10 * 60 * 60 * 1000,
        services: [
            { serviceId: "2.1.5", serviceName: "Nachwischen von glatten Bodenbelägen manuell", isTarget: true, isFulfilled: true },
            { serviceId: "2.1.2", serviceName: "Abwischen von Oberflächen Schränke, Ablagen, Türen, Türstöcke", isTarget: true, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-07-004",
        status: 'Ausstehend',
        isLocked: false,
    },
     {
        id: "ap_06",
        customerId: "cust_02",
        date: "2024-06-10",
        employees: ["Abi Shala", "Besire"],
        durationMs: 22 * 60 * 60 * 1000,
        services: [
            { serviceId: "3.2", serviceName: "Kehren", isTarget: true, isFulfilled: true },
            { serviceId: "3.3", serviceName: "Saugen", isTarget: true, isFulfilled: true },
            { serviceId: "3.4", serviceName: "Wischen", isTarget: true, isFulfilled: true },
        ],
        protocolNumber: "AP-2024-06-011",
        status: 'Abgeschlossen',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // Placeholder
        isLocked: true,
    }
];