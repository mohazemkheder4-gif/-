import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { Bell, MapPin, Users, Calendar, UserPlus, Plus, X, Check, Award, LogOut, Waves, AlertCircle, BadgeCheck, ShieldCheck } from 'lucide-react';
import { cn, getArabicDayName } from '../lib/utils';
import { GuestRequest } from '../types';

export function HomeScreen() {
  const { 
    user, bookings, activeBookingId, setActiveBooking, 
    players, guestRequests, requestGuest, logout, 
    completeBooking, markAttendance, removeAttendance, attendance, setViewingPlayerId
  } = useAppStore();
  const [reason, setReason] = useState('');
  const { playSound } = useSoundEffects();
  
  const currentBooking = bookings.find(b => b.id === activeBookingId && b.status === 'مفتوح') || bookings.find(b => b.status === 'مفتوح');
  
  // Auto archive/cleanup logic for expired additional bookings
  React.useEffect(() => {
    const checkExpired = () => {
      const now = new Date();
      bookings.filter(b => b.status === 'مفتوح').forEach(b => {
        const matchEnd = new Date(`${b.matchDate}T${b.matchEndTime}`);
        if (now > matchEnd) {
          // If it's additional, we delete it after archiving. If fixed, we just archive.
          if (b.type === 'إضافي') {
             completeBooking(b.id);
             // The store logic should be updated to remove it if type is additional
          } else {
             completeBooking(b.id);
          }
        }
      });
    };
    const timer = setInterval(checkExpired, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [bookings, completeBooking]);

  // If we have an active booking but it's cancelled, we might want to see the cancellation message
  // But the user asked to stop the counter if no other match.
  const showCancelledView = !currentBooking && activeBookingId && bookings.find(b => b.id === activeBookingId && b.status === 'ملغي');
  const cancelledBooking = showCancelledView ? bookings.find(b => b.id === activeBookingId) : null;

  React.useEffect(() => {
    if (activeBookingId && !bookings.find(b => b.id === activeBookingId && b.status === 'مفتوح')) {
      const next = bookings.find(b => b.status === 'مفتوح');
      if (next) setActiveBooking(next.id);
    }
  }, [bookings, activeBookingId, setActiveBooking]);

  if (!user) return null;

  if (showCancelledView && cancelledBooking) {
    return (
      <div className="pb-24 pt-12 px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center border border-danger/20 text-danger">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-arabic text-danger">تم إلغاء المباراة</h2>
          <p className="text-sm text-white/40 font-arabic leading-relaxed px-4">
             تم إلغاء حجز {getArabicDayName(cancelledBooking.matchDate)} ({cancelledBooking.category}).
             يرجى متابعة الدردشة للتفاصيل.
          </p>
        </div>
        <button 
          onClick={() => {
            const next = bookings.find(b => b.status === 'مفتوح');
            if (next) setActiveBooking(next.id);
            else setActiveBooking('');
          }}
          className="text-xs font-bold font-arabic text-white/40 border-b border-white/10 pb-1"
        >
          البحث عن موعد آخر
        </button>
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="pb-24 pt-12 px-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-dashed border-white/10">
          <Calendar size={40} className="text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-arabic">لا توجد مباريات مجدولة حالياً</h2>
          <p className="text-sm text-white/40 font-arabic">سيظهر العداد بمجرد إضافة حجز جديد من قبل المسؤول</p>
        </div>
        {user.isAdmin && (
          <button 
            onClick={() => useAppStore.getState().setActiveTab('admin')}
            className="flex items-center gap-2 bg-brand text-background px-6 py-3 rounded-2xl font-bold font-arabic shadow-lg shadow-brand/20 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            إضافة حجز الآن
          </button>
        )}
      </div>
    );
  }

  const myAttendance = attendance.find(a => a.bookingId === currentBooking.id && a.playerId === user.id);

  const handleAttendance = (status: 'حاضر' | 'غائب', providedReason?: string) => {
    if (myAttendance?.status === status && !providedReason) {
      removeAttendance(currentBooking.id, user.id);
    } else {
      markAttendance(currentBooking.id, user.id, status, status === 'غائب' ? (providedReason || reason) : undefined);
      if (status === 'حاضر') playSound('success');
    }
  };

  const handleRequestGuest = () => {
    const name = prompt('اسم الضيف المرافق:');
    if (name) requestGuest(name);
  };

  const fixedBookings = bookings.filter(b => b.type === 'ثابت' && b.status === 'مفتوح');
  const extraBookings = bookings.filter(b => b.type === 'إضافي' && b.status === 'مفتوح');

  return (
    <div className="pb-24 pt-6 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand shadow-[0_0_15px_rgba(0,200,83,0.2)]">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-arabic leading-tight">إدارة {user.name}</h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] text-white/40 font-arabic">متصل الآن</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl bg-card border border-white/5 text-brand relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-card" />
          </button>
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl bg-card border border-white/5 text-danger active:scale-95 transition-transform"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

       {/* Booking Selector Tabs if multiple */}
      {(bookings.filter(b => b.status === 'مفتوح').length > 1) && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
           {bookings.filter(b => b.status === 'مفتوح').map(b => (
             <button 
               key={b.id}
               onClick={() => setActiveBooking(b.id)}
               className={cn(
                 "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold font-arabic transition-all flex items-center gap-2",
                 activeBookingId === b.id ? "bg-brand text-background shadow-lg shadow-brand/20" : "bg-white/5 text-white/40 border border-white/5"
               )}
             >
               {b.category === 'سباحة' ? <Waves size={12} className={activeBookingId === b.id ? "text-background" : "text-blue-400"} /> : <Award size={12} className={activeBookingId === b.id ? "text-background" : "text-brand"} />}
               {getArabicDayName(b.matchDate)} {b.type === 'ثابت' ? `(${b.category})` : '(إضافي)'}
             </button>
           ))}
        </div>
      )}

      {/* Next Match Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold font-arabic flex items-center gap-2">
            {currentBooking.category === 'سباحة' ? <Waves size={18} className="text-blue-400" /> : <Award size={18} className="text-brand" />}
            تجمع {currentBooking.category} - {getArabicDayName(currentBooking.matchDate)}
          </h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-md font-arabic",
            currentBooking.type === 'ثابت' ? "text-brand bg-brand/10" : "text-accent bg-accent/10"
          )}>
            {currentBooking.type === 'ثابت' ? 'حجز دوري ثابت' : 'حجز إضافي'}
          </span>
        </div>
        
        <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 blur-3xl",
            currentBooking.category === 'سباحة' ? "bg-blue-500/10" : "bg-brand/5"
          )} />
          
          <div className="text-center mb-6">
            <p className="text-xs text-white/40 font-arabic mb-1">{currentBooking.category === 'سباحة' ? 'اسم المسبح' : 'اسم الملعب'}</p>
            <h4 className="text-xl font-bold font-arabic mb-4">{currentBooking.venueName}</h4>
            
            <div className="flex flex-col items-center gap-1 mb-4">
              <span className="text-4xl font-black text-brand">
                {useAppStore.getState().attendance.filter(a => a.bookingId === currentBooking.id && a.status === 'حاضر').length} / {players.length}
              </span>
              <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/60">{currentBooking.matchTime}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-mono text-white/60">{currentBooking.matchEndTime}</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 font-arabic uppercase tracking-widest">عدد الحاضرين المؤكدين</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <CountdownTimer 
              matchDate={currentBooking.matchDate} 
              startTime={currentBooking.matchTime} 
              endTime={currentBooking.matchEndTime}
              onFinished={() => {
                // Auto archive for admins (or let any client trigger it for simulation)
                // In a real app this would be server-side
                completeBooking(currentBooking.id);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatusAction 
              icon={MapPin} 
              label={currentBooking.category === 'سباحة' ? 'موقع المسبح' : 'موقع الملعب'} 
              iconClassName={currentBooking.category === 'سباحة' ? 'text-blue-400' : 'text-brand'}
            />
            <StatusAction icon={Calendar} label="إضافة للتقويم" />
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      {user.isAdmin && (
        <div className="mb-8 p-5 bg-brand/5 border border-brand/20 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <ShieldCheck size={16} className="text-brand" />
            <span className="text-xs font-bold font-arabic text-white/40">لوحة المسؤول السريعة ({currentBooking.category})</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                const reason = prompt('يرجى كتابة سبب الإلغاء لإخطار الجميع:');
                if (reason) useAppStore.getState().cancelBooking(currentBooking.id, reason);
              }}
              className="flex items-center justify-center gap-2 py-3.5 bg-danger/10 text-danger rounded-2xl text-[10px] font-bold font-arabic active:scale-95 transition-transform border border-danger/20"
            >
              <AlertCircle size={14} />
              إلغاء المباراة
            </button>
            <button 
              onClick={() => {
                if (confirm('هل تريد أرشفة هذا الحجز الآن وتجهيز الأسبوع القادم؟')) {
                  completeBooking(currentBooking.id);
                }
              }}
              className="flex items-center justify-center gap-2 py-3.5 bg-brand/10 text-brand rounded-2xl text-[10px] font-bold font-arabic active:scale-95 transition-transform border border-brand/20"
            >
              <Check size={14} />
              إنهاء وأرشفة
            </button>
          </div>
        </div>
      )}

      {/* Quick Attendance Section */}
      <div className="mb-8">
        <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold font-arabic text-lg">هل أنت قادم يا بطل؟</h3>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold font-arabic",
              myAttendance?.status === 'حاضر' ? "bg-brand/10 text-brand" : 
              myAttendance?.status === 'غائب' ? "bg-danger/10 text-danger" : 
              "bg-white/5 text-white/20"
            )}>
              {myAttendance?.status === 'حاضر' ? 'سأحضر ✅' : myAttendance?.status === 'غائب' ? 'معتذر ❌' : 'بانتظار قرارك'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AttendanceButton 
              active={myAttendance?.status === 'حاضر'} 
              onClick={() => handleAttendance('حاضر')}
              icon={Check}
              label="سأحضر"
              color="brand"
            />
            <AttendanceButton 
              active={myAttendance?.status === 'غائب'} 
              onClick={() => handleAttendance('غائب')}
              icon={X}
              label="لا أستطيع"
              color="danger"
            />
          </div>

          {myAttendance?.status === 'غائب' && !myAttendance.reason && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6"
            >
              <p className="text-xs text-white/40 font-arabic mb-2">هل تود ذكر سبب الغياب؟ (اختياري):</p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-arabic focus:border-brand/50 outline-none"
                placeholder="مثال: شغل، إصابة، سفر..."
                rows={2}
              />
              <button 
                onClick={() => handleAttendance('غائب', reason || 'لم يتم ذكر سبب')}
                className="w-full mt-3 py-3 bg-brand/10 text-brand rounded-xl font-bold font-arabic"
              >
                حفظ السبب
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Attendance List */}
      <div className="mb-8">
        <h3 className="font-bold font-arabic px-2 mb-4">قائمة الحضور</h3>
        <div className="flex flex-col gap-3">
          {players.map(player => {
            const status = attendance.find(a => a.bookingId === currentBooking.id && a.playerId === player.id)?.status;
            return (
              <div 
                key={player.id} 
                onClick={() => setViewingPlayerId(player.id)}
                className="bg-card rounded-2xl p-4 border border-white/5 flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden">
                    <img src={player.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold font-arabic text-sm flex items-center gap-1">
                      {player.name}
                      {player.isVerified && <BadgeCheck size={14} className="text-brand" />}
                      {player.isSuperAdmin ? (
                        <ShieldCheck size={14} className="text-brand" title="مشرف أساسي" />
                      ) : player.isAdmin ? (
                        <ShieldCheck size={14} className="text-blue-400" title="مشرف مجموعة" />
                      ) : null}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold font-arabic",
                  status === 'حاضر' ? "bg-brand/10 text-brand" : 
                  status === 'غائب' ? "bg-danger/10 text-danger" : 
                  "bg-white/5 text-white/20"
                )}>
                  {status === 'حاضر' ? 'حاضر' : status === 'غائب' ? 'معتذر' : 'لم يقرر'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Guest Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold font-arabic">طلبات المرافقين</h3>
          <button 
            onClick={handleRequestGuest}
            className="flex items-center gap-1.5 text-brand bg-brand/10 px-3 py-1.5 rounded-xl text-[10px] font-bold font-arabic border border-brand/20 active:scale-95 transition-transform"
          >
            <Plus size={14} />
            <span>طلب ضيف</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {guestRequests.filter(r => r.bookingId === currentBooking.id).length > 0 ? (
            guestRequests
              .filter(r => r.bookingId === currentBooking.id)
              .map(request => (
                <GuestVoteItem key={request.id} request={request} />
              ))
          ) : (
            <div className="bg-card/50 border border-dashed border-white/5 rounded-3xl p-8 text-center">
              <UserPlus size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-[10px] text-white/20 font-arabic">لا يوجد طلبات مرافقة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* Golden Player Section */}
      <div className="mb-8">
        <h3 className="font-bold font-arabic mb-4 px-2">اللاعب الذهبي للأسبوع</h3>
        {players.length > 0 && (() => {
          const goldenPlayer = [...players].sort((a, b) => b.stats.motmCount - a.stats.motmCount)[0];
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand/5 border border-brand/20 rounded-3xl p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={80} className="text-brand -rotate-12" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand shadow-lg">
                  <img src={goldenPlayer.avatarUrl} alt={goldenPlayer.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-brand text-background text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">MVP</span>
                    <h4 className="text-lg font-bold font-arabic">{goldenPlayer.name}</h4>
                  </div>
                  <p className="text-xs text-white/40 font-arabic">حصل على رجل المباراة {goldenPlayer.stats.motmCount} مرات</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
                 <div className="bg-background/40 rounded-xl p-2 text-center">
                    <span className="block text-brand font-black text-sm">{goldenPlayer.rating.overall}</span>
                    <span className="block text-[8px] text-white/40 font-arabic">التقييم</span>
                 </div>
                 <div className="bg-background/40 rounded-xl p-2 text-center">
                    <span className="block text-brand font-black text-sm">{goldenPlayer.stats.goals}</span>
                    <span className="block text-[8px] text-white/40 font-arabic">أهداف</span>
                 </div>
                 <div className="bg-background/40 rounded-xl p-2 text-center">
                    <span className="block text-brand font-black text-sm">{goldenPlayer.stats.assists}</span>
                    <span className="block text-[8px] text-white/40 font-arabic">صناعة</span>
                 </div>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}

function GuestVoteItem({ request }: { request: GuestRequest, key?: string }) {
  const { voteOnGuest, user, players } = useAppStore();
  const requester = players.find(p => p.id === request.requesterId);
  const myVote = request.votes.find(v => v.playerId === user?.id)?.vote;

  const forVotes = request.votes.filter(v => v.vote === 'for').length;
  const againstVotes = request.votes.filter(v => v.vote === 'against').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-white/5 space-y-4 shadow-lg group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
            request.status === 'accepted' ? "bg-brand/10 border-brand/20 text-brand" : 
            request.status === 'rejected' ? "bg-danger/10 border-danger/20 text-danger" :
            "bg-white/5 border-white/5 text-white/40"
          )}>
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-arabic">{request.guestName}</h4>
            <p className="text-[10px] text-white/40 font-arabic">بواسطة: {requester?.name || 'لاعب سابق'}</p>
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-md text-[8px] font-bold font-arabic",
          request.status === 'pending' ? "bg-accent/10 text-accent" :
          request.status === 'accepted' ? "bg-brand/10 text-brand" : "bg-danger/10 text-danger"
        )}>
          {request.status === 'pending' ? 'قيد التصويت' : request.status === 'accepted' ? 'تم القبول ✅' : 'مرفوض ❌'}
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => voteOnGuest(request.id, 'against')}
            className={cn(
              "flex-1 py-2.5 rounded-xl border text-[10px] font-bold font-arabic transition-all flex items-center justify-center gap-2",
              myVote === 'against' 
                ? "bg-danger text-white border-danger shadow-[0_0_15px_rgba(255,23,68,0.3)]" 
                : "bg-white/5 border-white/5 text-white/40 hover:bg-danger/5 hover:border-danger/20"
            )}
          >
            <X size={14} />
            ضد ({againstVotes})
          </button>
          <button 
            onClick={() => voteOnGuest(request.id, 'for')}
            className={cn(
              "flex-1 py-2.5 rounded-xl border text-[10px] font-bold font-arabic transition-all flex items-center justify-center gap-2",
              myVote === 'for' 
                ? "bg-brand text-background border-brand shadow-[0_0_15px_rgba(0,200,83,0.3)]" 
                : "bg-white/5 border-white/5 text-white/40 hover:bg-brand/5 hover:border-brand/20"
            )}
          >
            <Check size={14} />
            مع ({forVotes})
          </button>
        </div>
      )}
      
      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 right-0 bg-brand/40 transition-all duration-500" style={{ width: `${(forVotes / (forVotes + againstVotes || 1)) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 bg-danger/40 transition-all duration-500" style={{ width: `${(againstVotes / (forVotes + againstVotes || 1)) * 100}%` }} />
      </div>
    </motion.div>
  );
}

function StatusAction({ icon: Icon, label, iconClassName }: { icon: any, label: string, iconClassName?: string }) {
  return (
    <button className="flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-white/60">
      <Icon size={16} className={iconClassName} />
      <span className="text-xs font-bold font-arabic">{label}</span>
    </button>
  );
}

function AttendanceButton({ active, onClick, icon: Icon, label, color }: any) {
  const colorClasses = {
    brand: active ? "bg-brand/10 border-brand text-brand" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20",
    danger: active ? "bg-danger/10 border-danger text-danger" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
  };

  const dotClasses = {
    brand: "bg-brand shadow-[0_0_10px_#00C853]",
    danger: "bg-danger shadow-[0_0_10px_#FF1744]"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
        colorClasses[color as keyof typeof colorClasses]
      )}
    >
      <Icon size={32} />
      <span className="text-sm font-bold font-arabic">{label}</span>
      {active && <div className={cn("w-1.5 h-1.5 rounded-full", dotClasses[color as keyof typeof dotClasses])} />}
    </button>
  );
}
