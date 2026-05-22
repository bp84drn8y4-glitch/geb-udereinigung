import React from 'react';

interface PerformanceDonutChartProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    label: string;
    valueText: string;
}

export const PerformanceDonutChart: React.FC<PerformanceDonutChartProps> = ({
    percentage,
    size = 100,
    strokeWidth = 10,
    label,
    valueText,
}) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, percentage) / 100) * circumference;

    const isOverTarget = percentage > 100;
    const colorClass = isOverTarget 
        ? "text-green-500" 
        : percentage > 80 
        ? "text-sky-700 dark:text-sky-500" 
        : percentage > 50 
        ? "text-sky-600 dark:text-sky-400" 
        : "text-amber-500";
        
    const textColor = isOverTarget 
        ? "text-green-600 dark:text-green-400" 
        : "text-sky-800 dark:text-sky-300";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    <circle
                        className="text-slate-200 dark:text-slate-700"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={center}
                        cy={center}
                    />
                    <circle
                        className={colorClass}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={center}
                        cy={center}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center ${textColor}`}>
                    <span className="text-xl font-bold">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>
            <div className="text-center">
                <p className="font-bold text-sky-800 dark:text-sky-300">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{valueText}</p>
            </div>
        </div>
    );
};

export default PerformanceDonutChart;
