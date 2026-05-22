export type ProspectStatus = 'longlist' | 'shortlist' | 'offer-sent' | 'rejected' | 'customer';

export interface Prospect {
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
    status: ProspectStatus;
}

export const prospects: Prospect[] = [
    {
        id: 'prospect_1',
        companyName: 'Möbelhaus XXL',
        contactPerson: 'Gerhard Schmidt',
        phone: '089-123456',
        email: 'gschmidt@moebel-xxl.de',
        status: 'longlist',
    },
    {
        id: 'prospect_2',
        companyName: 'Anwaltskanzlei Recht & Sicher',
        contactPerson: 'Dr. Sabine Maier',
        phone: '030-987654',
        email: 's.maier@recht-sicher.de',
        status: 'longlist',
    },
    {
        id: 'prospect_3',
        companyName: 'Tech StartUp InnovateNow',
        contactPerson: 'Alex Huber',
        phone: '0176-22334455',
        email: 'a.huber@innovatenow.io',
        status: 'shortlist',
    },
    {
        id: 'prospect_4',
        companyName: 'Bäckerei Krümel',
        contactPerson: 'Hans Bäcker',
        phone: '040-555666',
        email: 'info@baeckerei-kruemel.de',
        status: 'shortlist',
    },
    {
        id: 'prospect_5',
        companyName: 'Fitnessstudio PumpUp',
        contactPerson: 'Kevin Gross',
        phone: '0221-778899',
        email: 'k.gross@pumpup-gym.de',
        status: 'rejected',
    },
];