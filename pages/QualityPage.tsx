import React, { useMemo } from 'react';
import { AcceptanceProtocol, QualityRating, Answer } from '../data/acceptanceProtocols';
import { Customer } from '../data/customers';
import { QualityQuestion } from '../data/qualityQuestions';
import { ChartPieIcon, HappyFaceIcon, NeutralFaceIcon, SadFaceIcon } from '../components/icons';
import PerformanceDonutChart from '../components/PerformanceDonutChart';

interface QualityPageProps {
    protocols: AcceptanceProtocol[];
    customers: Customer[];
    qualityQuestions: QualityQuestion[];
}

// FIX: Define a type for the stats object value for better type inference.
type QualityStat = {
    questionText: string;
    good: number;
    neutral: number;
    bad: number;
    total: number;
};

const QualityPage: React.FC<QualityPageProps> = ({ protocols, customers, qualityQuestions }) => {

    const feedbackData = useMemo(() => {
        const allFeedbackProtocols = protocols.filter(p => p.qualityFeedback && p.qualityFeedback.answers.length > 0);
        const urgentRequests = allFeedbackProtocols.filter(p => p.qualityFeedback?.requestSupervisor);

        const stats: Record<string, QualityStat> = {};
        qualityQuestions.forEach(q => {
            stats[q.id] = { questionText: q.text, good: 0, neutral: 0, bad: 0, total: 0 };
        });

        allFeedbackProtocols.forEach(p => {
            p.qualityFeedback?.answers.forEach(answer => {
                if (stats[answer.questionId]) {
                    stats[answer.questionId][answer.rating]++;
                    stats[answer.questionId].total++;
                }
            });
        });

        return { allFeedbackProtocols, urgentRequests, stats };

    }, [protocols, qualityQuestions]);

    const getCustomerName = (customerId: string) => {
        return customers.find(c => c.id === customerId)?.name || 'Unbekannter Kunde';
    };

    const RatingIcon: React.FC<{ rating: QualityRating }> = ({ rating }) => {
        if (rating === 'good') return <HappyFaceIcon className="w-5 h-5 text-green-500" />;
        if (rating === 'neutral') return <NeutralFaceIcon className="w-5 h-5 text-amber-500" />;
        return <SadFaceIcon className="w-5 h-5 text-red-500" />;
    }

    const StatChart: React.FC<{ title: string, data: { good: number, neutral: number, bad: number, total: number } }> = ({ title, data }) => (
        <div className="flex flex-col items-center">
            <PerformanceDonutChart 
                percentage={data.total > 0 ? (data.good / data.total) * 100 : 0}
                size={120}
                strokeWidth={12}
                label={title}
                valueText={`${data.good} / ${data.total} Gut`}
            />
             <div className="flex gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1" title="Gut"><HappyFaceIcon className="w-4 h-4 text-green-500"/>{data.good}</span>
                <span className="flex items-center gap-1" title="Neutral"><NeutralFaceIcon className="w-4 h-4 text-amber-500"/>{data.neutral}</span>
                <span className="flex items-center gap-1" title="Schlecht"><SadFaceIcon className="w-4 h-4 text-red-500"/>{data.bad}</span>
            </div>
        </div>
    );
    
    const AnswerLog: React.FC<{ answer: Answer }> = ({ answer }) => {
        const question = qualityQuestions.find(q => q.id === answer.questionId);
        if (!question) return null;
        
        return (
            <div className="flex items-center gap-2">
                <RatingIcon rating={answer.rating} />
                <span className="text-sm">{question.text}</span>
            </div>
        );
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 text-sky-800 dark:text-sky-300">
                <ChartPieIcon className="w-8 h-8"/>
                <h2 className="text-3xl font-bold">Qualitätsauswertung</h2>
            </div>

            {/* Urgent Actions */}
            {feedbackData.urgentRequests.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl shadow-lg border border-red-200 dark:border-red-700/50">
                    <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-4">Dringender Handlungsbedarf</h3>
                    <div className="space-y-4">
                        {feedbackData.urgentRequests.map(p => (
                            <div key={p.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800/50">
                                <p className="font-bold">{getCustomerName(p.customerId)} - Protokoll {p.protocolNumber}</p>
                                <p className="text-sm text-slate-500">{new Date(p.date).toLocaleDateString('de-DE')}</p>
                                {p.qualityFeedback?.notes && <p className="mt-2 text-sm italic bg-red-50 dark:bg-red-900/20 p-2 rounded-md">"{p.qualityFeedback.notes}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Stats Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6 text-center">Statistische Übersicht</h3>
                 <div className="flex flex-wrap gap-8 justify-center">
                    {Object.entries(feedbackData.stats)
                        // FIX: Explicitly type `data` in the callback to resolve TS inference issue.
                        .filter(([, data]: [string, QualityStat]) => data.total > 0)
                        // FIX: Explicitly type `data` in the callback to resolve TS inference issue.
                        .map(([questionId, data]: [string, QualityStat]) => (
                            <StatChart key={questionId} title={data.questionText} data={data} />
                    ))}
                    {Object.values(feedbackData.stats).every((s: QualityStat) => s.total === 0) && (
                         <p className="text-center text-slate-500 py-4">Noch kein Feedback zu aktiven Fragen vorhanden.</p>
                    )}
                </div>
            </div>

            {/* Feedback Log */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Feedback-Protokoll</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {feedbackData.allFeedbackProtocols.length > 0 ? [...feedbackData.allFeedbackProtocols].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                        <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold">{getCustomerName(p.customerId)}</p>
                                    <p className="text-sm text-slate-500">Protokoll {p.protocolNumber} vom {new Date(p.date).toLocaleDateString('de-DE')}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {p.qualityFeedback!.answers.map(answer => <AnswerLog key={answer.questionId} answer={answer}/>)}
                            </div>
                             {p.qualityFeedback?.notes && <p className="mt-2 text-sm italic bg-slate-100 dark:bg-slate-800 p-2 rounded-md">"{p.qualityFeedback.notes}"</p>}
                        </div>
                    )) : <p className="text-center text-slate-500 py-4">Noch kein Feedback vorhanden.</p>}
                </div>
            </div>
        </div>
    );
};

export default QualityPage;
