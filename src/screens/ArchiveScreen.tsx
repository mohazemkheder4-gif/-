import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { getArabicDayName } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import { SessionHistory, Player } from '../types';

export function ArchiveScreen() {
  const { history, players } = useAppStore();

  return (
    <div className="pb-24 pt-6 px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-arabic">سجل التجمعات</h2>
        <p className="text-white/40 text-sm font-arabic">كشف الحضور والغياب للقاءاتنا السابقة</p>
      </div>

      <div className="space-y-6">
        {history.map((session) => (
          <SessionHistoryCard 
            key={session.id}
            session={session}
            players={players}
          />
        ))}
        {history.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-white/10">
            <Calendar size={40} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/20 font-arabic text-sm">لا يوجد سجلات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: SessionHistory;
  players: Player[];
  key?: React.Key;
}

function SessionHistoryCard({ session, players }: SessionCardProps) {
  const attendeesList = players.filter(p => session.attendees.includes(p.id));
  const markedAbsentList = players.filter(p => session.absentees.includes(p.id));
  const unResponsiveList = players.filter(p => 
    !session.attendees.includes(p.id) && !session.absentees.includes(p.id)
  );
  
  const [showAttendees, setShowAttendees] = useState(false);
  const [showMarkedAbsent, setShowMarkedAbsent] = useState(false);
  const [showUnResponsive, setShowUnResponsive] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl border border-white/5 overflow-hidden shadow-lg"
    >
      <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="font-bold font-arabic text-sm">
              {getArabicDayName(session.date)}
            </h4>
            <p className="text-[10px] text-white/40 font-mono">{session.date}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Attendees */}
        <div className="space-y-2">
          <button 
            onClick={() => setShowAttendees(!showAttendees)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs font-bold font-arabic text-brand">حاضر ({attendeesList.length})</span>
            </div>
            <div className="text-white/20 group-hover:text-white transition-colors">
              {showAttendees ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          
          <AnimatePresence>
            {showAttendees && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 py-2">
                  {attendeesList.map(p => (
                    <span key={p.id} className="bg-white/5 text-white/60 px-3 py-1.5 rounded-xl text-[11px] font-arabic border border-white/5">
                      {p.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Marked Absent */}
        <div className="space-y-2">
          <button 
            onClick={() => setShowMarkedAbsent(!showMarkedAbsent)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-xs font-bold font-arabic text-danger">اعتذروا ({markedAbsentList.length})</span>
            </div>
            <div className="text-white/20 group-hover:text-white transition-colors">
              {showMarkedAbsent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          
          <AnimatePresence>
            {showMarkedAbsent && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 py-2">
                  {markedAbsentList.length > 0 ? markedAbsentList.map(p => (
                    <span key={p.id} className="bg-danger/5 text-danger/60 px-3 py-1.5 rounded-xl text-[11px] font-arabic border border-danger/10">
                      {p.name}
                    </span>
                  )) : (
                    <p className="text-[10px] text-white/20 font-arabic py-2 mr-4">لا يوجد معتذرين</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unresponsive / Didn't Attend */}
        <div className="space-y-2">
          <button 
            onClick={() => setShowUnResponsive(!showUnResponsive)}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-xs font-bold font-arabic text-white/40">لم يحضروا / لم يردوا ({unResponsiveList.length})</span>
            </div>
            <div className="text-white/20 group-hover:text-white transition-colors">
              {showUnResponsive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          
          <AnimatePresence>
            {showUnResponsive && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 py-2">
                  {unResponsiveList.length > 0 ? unResponsiveList.map(p => (
                    <span key={p.id} className="bg-white/5 text-white/30 px-3 py-1.5 rounded-xl text-[11px] font-arabic border border-white/5 italic">
                      {p.name}
                    </span>
                  )) : (
                    <p className="text-[10px] text-white/10 font-arabic py-2 mr-4">الجميع تفاعل مع الحجز</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
