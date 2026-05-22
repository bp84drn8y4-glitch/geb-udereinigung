import React, { useMemo } from 'react';
import { AcceptanceProtocol } from '../data/acceptanceProtocols';
import { ChartBarIcon } from './icons';

interface OverviewChartProps {
    protocols: AcceptanceProtocol[];
}

const getMonthShortName = (monthIndex: number) => {
    return new Date(0, monthIndex).toLocaleString('de-DE', { month: 'short' });
}

export const OverviewChart: React.FC<OverviewChartProps> = ({ protocols }) => {
    const chartData = useMemo(() => {
        const data: { month: string, year: number, okCount: number, defectCount: number }[] = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
            
            const monthProtocols = protocols.filter(p => p.date.startsWith(monthKey));
            
            let okCount = 0;
            let defectCount = 0;

            monthProtocols.forEach(p => {
                const hasDefect = (p.services || []).some(s => s.isTarget && !s.isFulfilled);
                if (hasDefect) {
                    defectCount++;
                } else {
                    okCount++;
                }
            });
            
            data.push({
                month: getMonthShortName(month),
                year: year,
                okCount: okCount,
                defectCount: defectCount
            });
        }
        return data;
    }, [protocols]);

    const maxCount = Math.max(...chartData.map(d => d.okCount + d.defectCount), 1); // Avoid division by zero

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg h-full border border-transparent dark:border-slate-700/50">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center mb-4">
                <ChartBarIcon className="w-6 h-6 mr-2 text-sky-500"/>
                Protokoll-Qualität (Letzte 6 Monate)
            </h3>
            <div className="flex justify-around items-end h-48 w-full gap-2">
                {chartData.map((data, index) => {
                    const total = data.okCount + data.defectCount;
                    const okHeight = total > 0 ? (data.okCount / total) * 100 : 0;
                    const defectHeight = total > 0 ? (data.defectCount / total) * 100 : 0;
                    const totalHeight = (total / maxCount) * 100;

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 h-full">
                            <div className="relative w-full h-full flex items-end justify-center group">
                                <div
                                    className="w-3/4 flex flex-col-reverse items-end rounded-t-md overflow-hidden"
                                    style={{ height: `${totalHeight}%` }}
                                >
                                    <div 
                                        style={{ height: `${okHeight}%` }}
                                        className="w-full bg-green-300 dark:bg-green-800/70 group-hover:bg-green-400 dark:group-hover:bg-green-600 transition-all duration-300"
                                    ></div>
                                    <div 
                                        style={{ height: `${defectHeight}%` }}
                                        className="w-full bg-red-300 dark:bg-red-800/70 group-hover:bg-red-400 dark:group-hover:bg-red-600 transition-all duration-300"
                                    ></div>
                                </div>
                                <div className="absolute -top-10 hidden group-hover:block px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md shadow-lg text-left z-20">
                                    <p><span className="font-bold text-green-400">{data.okCount}</span> OK</p>
                                    <p><span className="font-bold text-red-400">{data.defectCount}</span> Mängel</p>
                                </div>
                            </div>
                            <span className="text-xs mt-2 text-slate-500 dark:text-slate-400 font-medium">{data.month}</span>
                        </div>
                    )
                })}
            </div>
             <div className="flex justify-center items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/70"></span>OK</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-300 dark:bg-red-800/70"></span>Mängel</div>
            </div>
        </div>
    );
};