import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Swords, Goal, Zap, ShieldAlert, Timer } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  teamA: Player[];
  teamB: Player[];
  onClose: () => void;
}

interface MatchEvent {
  id: string;
  player: Player;
  team: 'A' | 'B';
  type: 'pass' | 'dribble' | 'shoot' | 'tackle' | 'goal' | 'save';
  time: number;
}

export function MatchSimulator({ teamA, teamB, onClose }: Props) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentScore, setCurrentScore] = useState({ A: 0, B: 0 });
  const [isSimulating, setIsSimulating] = useState(true);
  const [matchTime, setMatchTime] = useState(0);
  const { playSound } = useSoundEffects();
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  const generateEvent = (time: number): MatchEvent => {
    const teams = ['A', 'B'] as const;
    const team = teams[Math.floor(Math.random() * teams.length)];
    const players = team === 'A' ? teamA : teamB;
    const player = players[Math.floor(Math.random() * players.length)];
    const types: MatchEvent['type'][] = ['pass', 'pass', 'dribble', 'tackle', 'shoot'];
    
    // Weighted probabilities
    let type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'shoot') {
      const isGoal = Math.random() > 0.7;
      type = isGoal ? 'goal' : 'save';
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      player,
      team,
      type,
      time
    };
  };

  useEffect(() => {
    playSound('whistle');
    
    let time = 0;
    const runSimulation = () => {
      if (time >= 90) {
        setIsSimulating(false);
        playSound('whistle');
        return;
      }

      time += Math.floor(Math.random() * 10) + 5;
      if (time > 90) time = 90;
      setMatchTime(time);

      const newEvent = generateEvent(time);
      setEvents(prev => [newEvent, ...prev].slice(0, 5));

      // Trigger sounds based on event type
      switch (newEvent.type) {
        case 'pass': playSound('pass'); break;
        case 'shoot': playSound('kick'); break;
        case 'goal': 
          playSound('goal');
          setCurrentScore(prev => ({ ...prev, [newEvent.team]: prev[newEvent.team] + 1 }));
          break;
        case 'tackle': playSound('tackle'); break;
        case 'dribble': playSound('pass'); break;
      }

      simulationRef.current = setTimeout(runSimulation, 2000);
    };

    runSimulation();

    return () => {
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, [playSound, teamA, teamB]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/95 backdrop-blur-md"
    >
      <div className="w-full max-w-md bg-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white/5 p-6 text-center border-b border-white/5">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-background font-black mb-1">A</div>
              <span className="text-[10px] text-white/40 font-bold uppercase">TEAM A</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black font-mono tracking-tighter">
                {currentScore.A} <span className="text-brand">:</span> {currentScore.B}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                <Timer size={10} className="text-brand" />
                <span className="text-[10px] font-mono text-white/60">{matchTime}'</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white font-black mb-1">B</div>
              <span className="text-[10px] text-white/40 font-bold uppercase">TEAM B</span>
            </div>
          </div>
          <h3 className="font-bold font-arabic text-lg">محاكاة المباراة</h3>
          <p className="text-[10px] text-white/40 font-arabic">جاري تحليل الأداء والمهارات الفردية...</p>
        </div>

        {/* Live Feed */}
        <div className="p-6 h-64 overflow-hidden relative">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: event.team === 'A' ? -20 : 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                    event.type === 'goal' ? "bg-brand/10 border-brand/30 shadow-[0_0_15px_rgba(0,200,83,0.2)]" : "bg-white/5 border-white/5"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    event.team === 'A' ? "bg-brand/20 text-brand" : "bg-white/10 text-white/60"
                  )}>
                    {event.type === 'goal' ? <Goal size={16} /> : 
                     event.type === 'pass' ? <Zap size={16} /> :
                     event.type === 'tackle' ? <ShieldAlert size={16} /> :
                     <Swords size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-arabic">{event.player.name}</span>
                      <span className="text-[10px] font-mono text-white/20">{event.time}'</span>
                    </div>
                    <p className="text-[10px] text-white/40 font-arabic">
                      {event.type === 'pass' ? 'تمريرة متقنة لزميله' :
                       event.type === 'dribble' ? 'مراوغة مذهلة في الوسط' :
                       event.type === 'shoot' ? 'يسدد بقوة نحو المرمى!' :
                       event.type === 'tackle' ? 'استخلاص رائع للكرة' :
                       event.type === 'goal' ? 'جووووووووول! هدف في التسعين' :
                       'تصدي أسطوري من الحارس'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Simulation Overlay */}
          {!isSimulating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mb-4 shadow-lg shadow-brand/30">
                <Goal size={32} className="text-background" />
              </div>
              <h4 className="text-xl font-bold font-arabic mb-1">انتهت المحاكاة</h4>
              <p className="text-xs text-white/40 font-arabic mb-6">بناءً على مهاراتكم الحالية، هذه هي النتيجة المتوقعة!</p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-brand text-background rounded-2xl font-bold font-arabic shadow-xl active:scale-95 transition-transform"
              >
                العودة للتشكيلة
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
