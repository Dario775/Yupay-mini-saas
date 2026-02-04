
import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = new Date(endDate).getTime() - now.getTime();
    if (diff <= 0) return 'Expirada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

interface ProductTimerProps {
    endDate: Date;
    className?: string;
}

export function ProductTimer({ endDate, className }: ProductTimerProps) {
    const [time, setTime] = useState(getTimeRemaining(endDate));

    useEffect(() => {
        setTime(getTimeRemaining(endDate));
        const interval = setInterval(() => setTime(getTimeRemaining(endDate)), 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <Timer className="h-3 w-3" />
            {time}
        </div>
    );
}
