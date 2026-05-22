export interface QualityQuestion {
    id: string;
    text: string;
    isActive: boolean;
}

export const qualityQuestions: QualityQuestion[] = [
    {
        id: 'q_punctuality',
        text: 'War der Mitarbeiter pünktlich?',
        isActive: true,
    },
    {
        id: 'q_friendliness',
        text: 'War der Mitarbeiter freundlich?',
        isActive: true,
    },
    {
        id: 'q_quality',
        text: 'Wurde die erwartete Qualität geliefert?',
        isActive: true,
    },
    {
        id: 'q_appearance',
        text: 'War das Erscheinungsbild des Mitarbeiters gepflegt?',
        isActive: false,
    }
];
