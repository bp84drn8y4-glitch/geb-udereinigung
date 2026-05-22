import React, { useState } from 'react';
import { QualityFeedback, QualityRating, Answer } from '../data/acceptanceProtocols';
import { QualityQuestion } from '../data/qualityQuestions';
import { HappyFaceIcon, NeutralFaceIcon, SadFaceIcon } from './icons';

interface QualityFeedbackModalProps {
    qualityQuestions: QualityQuestion[];
    onClose: () => void;
    onSubmit: (feedback: QualityFeedback) => void;
}

type RatingCategory = string; // Will be the question ID

const QualityFeedbackModal: React.FC<QualityFeedbackModalProps> = ({ qualityQuestions, onClose, onSubmit }) => {
    const [ratings, setRatings] = useState<Record<RatingCategory, QualityRating | null>>({});
    const [notes, setNotes] = useState('');
    const [requestSupervisor, setRequestSupervisor] = useState(false);
    const [error, setError] = useState('');

    const activeQuestions = qualityQuestions.filter(q => q.isActive);

    const handleRating = (category: RatingCategory, rating: QualityRating) => {
        setRatings(prev => ({ ...prev, [category]: rating }));
    };

    const handleSubmit = () => {
        const allAnswered = activeQuestions.every(q => ratings[q.id]);
        if (!allAnswered) {
            setError('Bitte bewerten Sie alle Kategorien.');
            return;
        }

        const answers: Answer[] = activeQuestions.map(q => ({
            questionId: q.id,
            rating: ratings[q.id]!,
        }));

        setError('');
        onSubmit({
            answers,
            notes,
            requestSupervisor,
        });
    };

    const renderSmiley = (category: RatingCategory, rating: QualityRating) => {
        const isSelected = ratings[category] === rating;
        const baseClasses = "w-12 h-12 cursor-pointer transition-transform transform hover:scale-110";
        const selectedClasses = "scale-110";
        const unselectedClasses = "opacity-40";

        if (rating === 'good') {
            return <HappyFaceIcon className={`${baseClasses} text-green-500 ${isSelected ? selectedClasses : unselectedClasses}`} onClick={() => handleRating(category, 'good')} />;
        }
        if (rating === 'neutral') {
            return <NeutralFaceIcon className={`${baseClasses} text-amber-500 ${isSelected ? selectedClasses : unselectedClasses}`} onClick={() => handleRating(category, 'neutral')} />;
        }
        return <SadFaceIcon className={`${baseClasses} text-red-500 ${isSelected ? selectedClasses : unselectedClasses}`} onClick={() => handleRating(category, 'bad')} />;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg space-y-6">
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-300">Wie zufrieden waren Sie?</h2>
                <p className="text-sm text-slate-500">Ihr Feedback hilft uns, unseren Service stetig zu verbessern.</p>
                
                <div className="space-y-4">
                    {activeQuestions.map(question => (
                         <div key={question.id}>
                            <p className="font-semibold mb-2 text-center">{question.text}</p>
                            <div className="flex justify-center gap-6">
                                {renderSmiley(question.id, 'good')}
                                {renderSmiley(question.id, 'neutral')}
                                {renderSmiley(question.id, 'bad')}
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <div>
                    <label htmlFor="notes" className="font-semibold mb-2 block">Anmerkungen (optional)</label>
                    <textarea 
                        id="notes" 
                        rows={3} 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Haben Sie weitere Anmerkungen für uns?"
                        className="w-full p-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500"
                    ></textarea>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <input 
                        type="checkbox" 
                        id="requestSupervisor" 
                        checked={requestSupervisor}
                        onChange={(e) => setRequestSupervisor(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor="requestSupervisor" className="text-sm font-medium">Ich möchte, dass mich ein Vorgesetzter kontaktiert.</label>
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-lg">Später</button>
                    <button onClick={handleSubmit} className="px-6 py-2 text-sm font-semibold bg-sky-700 text-white rounded-lg hover:bg-sky-800">Feedback absenden</button>
                </div>
            </div>
        </div>
    );
};

export default QualityFeedbackModal;