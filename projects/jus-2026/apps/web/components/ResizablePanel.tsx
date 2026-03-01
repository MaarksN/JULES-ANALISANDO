import React, { useState, useEffect, useRef } from 'react';

interface ResizablePanelProps {
    left: React.ReactNode;
    right: React.ReactNode;
    initialRightWidth?: number; // Porcentagem (ex: 50 para 50%)
    onResize?: (rightWidth: number) => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({ left, right, initialRightWidth = 50, onResize }) => {
    const [rightWidth, setRightWidth] = useState(initialRightWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            // Calcula a largura da direita baseada na posição do mouse relativa ao container
            // width = (containerRight - mouseX) / containerWidth * 100
            const newRightWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;

            if (newRightWidth > 20 && newRightWidth < 80) { // Limites min/max
                setRightWidth(newRightWidth);
                onResize?.(newRightWidth);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Previne seleção de texto durante arrasto
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onResize]);

    return (
        <div ref={containerRef} className="flex flex-1 w-full h-full overflow-hidden relative">
            {/* Painel Esquerdo (Chat) */}
            <div style={{ width: `${100 - rightWidth}%` }} className="h-full flex flex-col min-w-[20%]">
                {left}
            </div>

            {/* Handle de Redimensionamento */}
            <div
                onMouseDown={startResize}
                className={`w-1 h-full cursor-col-resize hover:bg-emerald-500 transition-colors z-30 flex flex-col justify-center items-center group ${isDragging ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
                <div className="h-8 w-1 bg-slate-400 dark:bg-slate-500 rounded-full group-hover:bg-white"></div>
            </div>

            {/* Painel Direito (Documento) */}
            <div style={{ width: `${rightWidth}%` }} className="h-full flex flex-col min-w-[20%]">
                {right}
            </div>
        </div>
    );
};

export default ResizablePanel;