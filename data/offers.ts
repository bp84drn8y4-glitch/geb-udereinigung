export interface OfferService {
    id: string;
    serviceName: string;
    details: string; // e.g., "10h à 55,00 €"
    total: number;
}

export interface Offer {
    id: string;
    offerNumber: string;
    prospectId: string;
    date: string;
    services: OfferService[];
    totalNet: number;
    vat: number;
    totalGross: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export const offers: Offer[] = [];
