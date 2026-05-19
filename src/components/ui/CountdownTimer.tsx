import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  matchDate: string;
  startTime: string;
  endTime: string;
  onFinished?: () => void;
}

export function CountdownTimer({ matchDate, startTime, endTime, onFinished }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'finished'>('upcoming');
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(`${matchDate}T${startTime}:00`);
      const end = new Date(`${matchDate}T${endTime}:00`);
      
      if (now < start) {
        setStatus('upcoming');
        setTimeLeft(Math.max(0, Math.floor((start.getTime() - now.getTime()) / 1000)));
      } else if (now >= start && now <= end) {
        setStatus('ongoing');
        setTimeLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
      } else {
        setStatus('finished');
        setTimeLeft(0);
        if (!hasAlerted && onFinished) {
          setHasAlerted(true);
          onFinished();
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [matchDate, startTime, endTime, hasAlerted, onFinished]);

  const days = Math.floor(timeLeft / (24 * 3600));
  const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Determine color based on status and time remaining
  let colorClass = "text-brand";
  let labelPrefix = "يبدأ خلال";

  if (status === 'ongoing') {
    labelPrefix = "ينتهي خلال";
    if (timeLeft < 300) { // Less than 5 minutes
      colorClass = "text-danger animate-pulse";
    } else if (timeLeft < 900) { // Less than 15 minutes
      colorClass = "text-orange-500";
    } else {
      colorClass = "text-blue-400 font-bold";
    }
  } else if (status === 'finished') {
    labelPrefix = "انتهى الحجز";
    colorClass = "text-white/20";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4 justify-center">
        {days > 0 && <TimeUnit value={days} label="يوم" colorClass={colorClass} />}
        <TimeUnit value={hours} label="ساعة" colorClass={colorClass} />
        <TimeUnit value={minutes} label="دقيقة" colorClass={colorClass} />
        <TimeUnit value={seconds} label="ثانية" colorClass={colorClass} />
      </div>
      <span className={cn("text-[10px] font-arabic font-bold px-3 py-1 rounded-full bg-white/5 border border-white/5", colorClass)}>
        {status === 'ongoing' ? '🔴 جاري الآن' : ''} {labelPrefix}
      </span>
    </div>
  );
}

function TimeUnit({ value, label, colorClass }: { value: number, label: string, colorClass: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-card w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-lg relative overflow-hidden group">
        <div className={cn("absolute inset-0 opacity-5 transition-colors", colorClass.replace('text-', 'bg-'))} />
        <span className={cn("text-2xl font-bold font-mono tabular-nums relative z-10", colorClass)}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-white/40 mt-1 uppercase font-medium font-arabic">{label}</span>
    </div>
  );
}

import { cn } from '../../lib/utils';
