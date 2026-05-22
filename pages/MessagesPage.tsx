import React, { useEffect } from 'react';
import { Message } from '../data/messages';
import { EnvelopeIcon } from '../components/icons';

interface MessagesPageProps {
    messages: Message[];
    onMarkAsRead: () => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ messages, onMarkAsRead }) => {
    
    useEffect(() => {
        onMarkAsRead();
    }, [onMarkAsRead]);

    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <EnvelopeIcon className="w-8 h-8 text-sky-700 dark:text-sky-300"/>
                <h2 className="text-2xl font-semibold text-sky-800 dark:text-sky-300">Meine Nachrichten</h2>
            </div>
            
            <div className="space-y-4">
                {sortedMessages.length > 0 ? (
                    sortedMessages.map(message => (
                        <div key={message.id} className={`p-4 rounded-lg border ${message.isRead ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700' : 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700/50'}`}>
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                                <span>Von: {message.sender}</span>
                                <span>{new Date(message.timestamp).toLocaleString('de-DE')}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{message.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-8">Sie haben keine Nachrichten.</p>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
