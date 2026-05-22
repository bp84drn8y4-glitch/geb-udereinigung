import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

const SignatureCanvas = forwardRef((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            // Adjust for DPI for crisper lines
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            
            ctx.strokeStyle = '#334155'; // dark:slate-700
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                 ctx.strokeStyle = '#e2e8f0'; // slate-200
            }
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        if (e.nativeEvent instanceof MouseEvent) {
             return { x: e.nativeEvent.clientX - rect.left, y: e.nativeEvent.clientY - rect.top };
        }
        if (e.nativeEvent instanceof TouchEvent) {
            return { x: e.nativeEvent.touches[0].clientX - rect.left, y: e.nativeEvent.touches[0].clientY - rect.top };
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setIsEmpty(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsEmpty(true);
        }
    };
    
    useImperativeHandle(ref, () => ({
        clear: clearCanvas,
        getSignature: () => {
            if (isEmpty) return null;
            const canvas = canvasRef.current;
            return canvas ? canvas.toDataURL('image/png') : null;
        }
    }));

    return (
        <div className="relative w-full">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-48 bg-slate-100 dark:bg-slate-900/70 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-crosshair"
            />
            <button type="button" onClick={clearCanvas} className="absolute top-2 right-2 px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
                Löschen
            </button>
        </div>
    );
});

export default SignatureCanvas;