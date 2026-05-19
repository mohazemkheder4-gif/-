import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { balanceTeams, BalancedTeams } from '../lib/algorithms';
import { Wand2, Lock, Shield, Swords, Zap, Award, BadgeCheck, ShieldCheck, Settings2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

import { MatchSimulator } from '../components/MatchSimulator';

export function LineupScreen() {
  const { players, attendance, bookings, activeBookingId, setActiveBooking, setViewingPlayerId, lineupSettings } = useAppStore();
  const [lineup, setLineup] = useState<BalancedTeams | null>(null);
  const [showSim, setShowSim] = useState(false);

  const currentBooking = bookings.find(b => b.id === activeBookingId);

  const handleBalance = () => {
    if (!currentBooking) return;
    
    // Filter players who marked as 'attending' for this booking
    const attendingIds = attendance
      .filter(a => a.bookingId === currentBooking.id && a.status === 'حاضر')
      .map(a => a.playerId);
      
    const attendingPlayers = players.filter(p => attendingIds.includes(p.id));
    
    if (attendingPlayers.length < 2) {
      alert('يجب وجود لاعبين حاضرين على الأقل لعمل التشكيلة');
      return;
    }

    const result = balanceTeams(attendingPlayers, lineupSettings.method, lineupSettings.playersPerTeam);
    setLineup(result);
  };

  return (
    <div className="pb-24 pt-6 px-6">
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-brand" />
          <span className="text-[10px] font-bold font-arabic text-white/60">الإعدادات: {lineupSettings.playersPerTeam} ضد {lineupSettings.playersPerTeam} ({lineupSettings.method === 'rating' ? 'متوازن' : 'عشوائي'})</span>
        </div>
        <button 
          onClick={() => useAppStore.getState().setActiveTab('admin')}
          className="text-[10px] font-bold font-arabic text-brand underline underline-offset-4"
        >
          تغيير
        </button>
      </div>

      {showSim && lineup && (
        <MatchSimulator 
          teamA={lineup.teamA} 
          teamB={lineup.teamB} 
          onClose={() => setShowSim(false)} 
        />
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold font-arabic">تقسيمة الشباب</h2>
          <p className="text-white/40 text-sm font-arabic">توزيع عادل ينهي جدل كل أسبوع ⚽</p>
        </div>
        <button 
          onClick={handleBalance}
          className="flex items-center gap-2 bg-brand text-background px-4 py-2.5 rounded-xl font-bold font-arabic shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:scale-105 transition-transform"
        >
          <Wand2 size={18} />
          <span>توزيع الفرق</span>
        </button>
      </div>

      {/* Booking Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
         {bookings.filter(b => b.status === 'مفتوح').map(b => (
           <button 
             key={b.id}
             onClick={() => setActiveBooking(b.id)}
             className={cn(
               "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold font-arabic transition-all",
               activeBookingId === b.id ? "bg-brand text-background shadow-lg shadow-brand/20" : "bg-white/5 text-white/40 border border-white/5"
             )}
           >
             {b.type === 'ثابت' ? `الحجز الثابت (${b.category})` : `حجز إضافي ${b.matchDate}`}
           </button>
         ))}
      </div>

      {lineup ? (
        <div className="space-y-8">
          <TeamCard team={lineup.teamA} name="أ" rating={lineup.teamAOverall} color="A" onPlayerClick={setViewingPlayerId} />
          <TeamCard team={lineup.teamB} name="ب" rating={lineup.teamBOverall} color="B" onPlayerClick={setViewingPlayerId} />
          
          {lineup.substitutes.length > 0 && (
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <RefreshCw size={16} />
                <h4 className="font-bold font-arabic text-sm">البدلاء / قائمة الانتظار ({lineup.substitutes.length})</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lineup.substitutes.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setViewingPlayerId(p.id)}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer"
                  >
                    <span className="text-xs font-arabic text-white/60">{p.name}</span>
                    <span className="text-[10px] font-mono text-white/20">{p.rating.overall}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowSim(true)}
              className="flex items-center justify-center gap-2 py-4 bg-brand/10 border border-brand/20 rounded-2xl text-brand font-bold font-arabic hover:bg-brand/20 transition-all"
            >
              <Swords size={18} />
              <span>نتوقع النتيجة؟</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all">
              <Lock size={18} />
              <span className="font-bold font-arabic">قفل التشكيلة</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Shield size={64} className="mb-4" />
          <p className="font-arabic">اضغط على التوزيع العادل لإنشاء الفرق</p>
        </div>
      )}

      {/* Hall of Fame Preview */}
      <div className="mt-12">
        <h3 className="font-bold font-arabic mb-6 text-brand flex items-center gap-2 underline underline-offset-8 decoration-brand/30">
          <Award size={20} />
          جوائز التقسيمة
        </h3>
        
        <div className="space-y-4">
          <AwardCard 
            title="نجم السهرة (MOTM)" 
            winner={players[1]} 
            voteProgress={75}
            icon={Award}
            active
          />
          <AwardCard 
            title='جائزة "الخشبة"' 
            subtitle="لأكثر لاعب أضاع فرصاً"
            icon={Shield}
          />
          <AwardCard 
            title="صاروخ الملعب" 
            subtitle="أسرع انطلاقة هجومية"
            icon={Zap}
          />
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, name, rating, color, onPlayerClick }: { team: any[], name: string, rating: number, color: 'A' | 'B', onPlayerClick: (id: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: color === 'A' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-3xl border border-white/5 shadow-xl overflow-hidden"
    >
      <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-bottom border-white/5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black",
            color === 'A' ? "bg-brand text-background" : "bg-white/20 text-white"
          )}>
            {name}
          </div>
          <h4 className="font-bold font-arabic text-lg">فريق {name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Swords size={16} className="text-white/20" />
          <span className="font-mono font-black text-brand text-xl">{rating}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        {team.map((player) => (
          <div 
            key={player.id} 
            onClick={() => onPlayerClick(player.id)}
            className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white/10" />
              <span className="text-md font-arabic font-medium flex items-center gap-1">
                {player.name}
                {player.isVerified && <BadgeCheck size={14} className="text-brand" />}
                {player.isSuperAdmin ? (
                  <ShieldCheck size={14} className="text-brand" title="مشرف أساسي" />
                ) : player.isAdmin ? (
                  <ShieldCheck size={14} className="text-blue-400" title="مشرف مجموعة" />
                ) : null}
              </span>
            </div>
            <span className="font-mono text-brand font-bold">{player.rating.overall}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AwardCard({ title, winner, subtitle, voteProgress, icon: Icon, active }: any) {
  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5 transition-all hover:border-brand/30 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            active ? "bg-brand/10 border-brand/20 text-brand" : "bg-white/5 border-white/5 text-white/20"
          )}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-arabic">{title}</h4>
            {subtitle && <p className="text-[10px] text-white/40 font-arabic">{subtitle}</p>}
          </div>
        </div>
        {!winner && (
          <button className="text-[10px] font-bold font-arabic text-white/40 hover:text-brand px-3 py-1.5 rounded-lg border border-white/5 hover:border-brand/30 transition-all">
            صوت الآن
          </button>
        )}
      </div>

      {winner && (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-brand/30 p-1 mb-4 relative">
            <img src={winner.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
            <div className="absolute -bottom-2 -right-2 bg-brand text-background text-[8px] font-black px-2 py-1 rounded-md">1ST</div>
          </div>
          <h5 className="font-bold font-arabic mb-4">{winner.name}</h5>
          
          {voteProgress && (
            <div className="w-full space-y-2">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${voteProgress}%` }}
                  className="h-full bg-brand shadow-[0_0_10px_rgba(0,200,83,0.5)]" 
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-arabic text-white/40">
                <span>تصويت مباشر</span>
                <span>{voteProgress}% من الأصوات</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
