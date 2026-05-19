import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { BookingCategory } from '../types';
import { 
  Calendar, 
  MapPin, 
  Bell, 
  RefreshCw, 
  XCircle, 
  UserPlus, 
  Phone, 
  ChevronRight,
  ShieldCheck,
  Settings2,
  Lock,
  UserPlus2,
  Trash2,
  UserCog,
  Waves,
  Award,
  BadgeCheck
} from 'lucide-react';
import { cn, getArabicDayName } from '../lib/utils';

export function AdminScreen() {
  const { 
    user,
    bookings, 
    activeBookingId, 
    setActiveBooking, 
    players, 
    addBooking, 
    deleteBooking,
    updateBooking, 
    resetWeek, 
    promoteToAdmin, 
    updatePlayerPhone, 
    updatePlayerPin,
    removePlayer,
    removeAttendance,
    cancelBooking, 
    sendMessage,
    completeBooking,
    setViewingPlayerId,
    appConfig,
    updateAppConfig
  } = useAppStore();
  
  const currentBooking = bookings.find(b => b.id === activeBookingId);
  const [editingBooking, setEditingBooking] = useState(false);
  const [newDate, setNewDate] = useState(currentBooking?.matchDate || '');
  const [newTime, setNewTime] = useState(currentBooking?.matchTime || '');
  const [newEndTime, setNewEndTime] = useState(currentBooking?.matchEndTime || '');
  const [newVenue, setNewVenue] = useState(currentBooking?.venueName || '');
  const [newMaps, setNewMaps] = useState(currentBooking?.venueMapsUrl || '');
  const [newCategory, setNewCategory] = useState<BookingCategory>(currentBooking?.category || 'كرة قدم');

  const [loginImageInput, setLoginImageInput] = useState(appConfig.loginImageUrl);

  const { createBookingProposalPoll } = useAppStore();

  const handleUpdateBooking = () => {
    if (activeBookingId) {
      updateBooking(activeBookingId, {
        matchDate: newDate,
        matchTime: newTime,
        matchEndTime: newEndTime,
        venueName: newVenue,
        venueMapsUrl: newMaps,
        category: newCategory
      });
    }
    setEditingBooking(false);
  };

  const handleAddExtraBooking = () => {
     addBooking({
        matchDate: new Date().toISOString().split('T')[0],
        matchTime: '21:00',
        matchEndTime: '23:00',
        venueName: 'حجز جديد',
        venueMapsUrl: '',
        type: 'إضافي',
        category: 'كرة قدم'
     });
     setEditingBooking(true);
  };

  const handleAddFixedBooking = () => {
     addBooking({
        matchDate: new Date().toISOString().split('T')[0],
        matchTime: '21:00',
        matchEndTime: '23:00',
        venueName: 'حجز ثابت جديد',
        venueMapsUrl: '',
        type: 'ثابت',
        category: 'كرة قدم'
     });
     setEditingBooking(true);
  };

  const handleProposalPoll = () => {
    const category = confirm('هل تريد التصويت على حجز (كرة قدم)؟ اضغط OK للكرة، Cancel للسباحة') ? 'كرة قدم' : 'سباحة';
    const date = prompt('أدخل التاريخ التقديري (مثلا الجمعة القادمة):');
    const time = prompt('أدخل الوقت التقديري:');
    
    if (date && time) {
      createBookingProposalPoll(category as any, 'إضافي', date, time);
      alert('تم إرسال رابط التصويت في الدردشة! تم تحديد النوع كـ (إضافي) لأن الحجوزات الثابتة يتم تنسيقها في الدردشة مباشرة.');
    }
  };

  const handleReminder = () => {
    sendMessage('📢 تذكير يا شباب بموعد حجزنا القادم! اللي لسا ما سجل حضوره يتفضل يلحق ⚽❤️');
    alert('تم إرسال التذكير للجميع!');
  };

  const handleCancelMatch = () => {
    if (!activeBookingId) return;
    const reason = prompt('يرجى كتابة سبب الإلغاء لإخطار الجميع:');
    if (reason) {
      cancelBooking(activeBookingId, reason);
    }
  };

  const [managingPlayers, setManagingPlayers] = useState(false);

  return (
    <div className="pb-24 pt-6 px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-arabic flex items-center gap-2">
          <Settings2 className="text-brand" />
          إعدادات التقسيمة
        </h2>
        <p className="text-white/40 text-sm font-arabic">لوحة التحكم الخاصة بمسؤول المجموعة</p>
      </div>

      {!managingPlayers ? (
        <div className="space-y-6">
          {/* Booking Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
             {bookings.filter(b => b.status === 'مفتوح').map(b => (
               <button 
                key={b.id}
                onClick={() => setActiveBooking(b.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold font-arabic transition-all flex items-center gap-2",
                  activeBookingId === b.id ? "bg-brand text-background" : "bg-white/5 text-white/40 border border-white/5"
                )}
               >
                 {b.category === 'سباحة' ? <Waves size={14} className={activeBookingId === b.id ? "text-background" : "text-blue-400"} /> : <Award size={14} className={activeBookingId === b.id ? "text-background" : "text-brand"} />}
                 {getArabicDayName(b.matchDate)} {b.type === 'ثابت' ? `(${b.category})` : '(إضافي)'}
               </button>
             ))}
             <div className="flex gap-2">
               <button 
                onClick={handleAddFixedBooking}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold font-arabic bg-brand/10 text-brand border border-brand/20"
               >
                 + حجز ثابت
               </button>
               <button 
                onClick={handleAddExtraBooking}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold font-arabic bg-accent/10 text-accent border border-accent/20"
               >
                 + حجز إضافي
               </button>
             </div>
          </div>

          {/* Booking Management */}
          <AdminSection 
            title={`إدارة حجز ال${currentBooking?.category}`} 
            icon={currentBooking?.category === 'سباحة' ? Waves : Award}
            color={currentBooking?.category === 'سباحة' ? 'blue' : 'brand'}
          >
            {editingBooking ? (
              <div className="space-y-4">
                <Input label="التاريخ" type="date" value={newDate} onChange={setNewDate} />
                <Input label="وقت البدء" type="time" value={newTime} onChange={setNewTime} />
                <Input label="وقت الانتهاء" type="time" value={newEndTime} onChange={setNewEndTime} />
                <Input label={newCategory === 'سباحة' ? 'اسم المسبح' : 'اسم الملعب'} value={newVenue} onChange={setNewVenue} />
                <Input label="رابط خرائط جوجل" value={newMaps} onChange={setNewMaps} />
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 font-arabic px-2">نوع النشاط</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-arabic focus:border-brand/40 outline-none appearance-none"
                  >
                    <option value="كرة قدم">كرة قدم</option>
                    <option value="سباحة">سباحة</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => setEditingBooking(false)} className="py-2 bg-white/5 rounded-xl font-arabic text-sm">إلغاء</button>
                    <button onClick={handleUpdateBooking} className="py-2 bg-brand text-background rounded-xl font-bold font-arabic text-sm">حفظ التغييرات</button>
                </div>
                {currentBooking && (
                  <button 
                    onClick={() => confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟') && deleteBooking(currentBooking.id)}
                    className="w-full mt-2 py-2 bg-danger/10 text-danger rounded-xl font-bold font-arabic text-xs border border-danger/20"
                  >
                    حذف الحجز بالكامل
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                   <span className="text-white/40 font-arabic">نوع النشاط الحالي:</span>
                   <span className="font-bold font-arabic text-brand">{currentBooking?.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setNewDate(currentBooking?.matchDate || '');
                      setNewTime(currentBooking?.matchTime || '');
                      setNewEndTime(currentBooking?.matchEndTime || '');
                      setNewVenue(currentBooking?.venueName || '');
                      setNewMaps(currentBooking?.venueMapsUrl || '');
                      setNewCategory(currentBooking?.category || 'كرة قدم');
                      setEditingBooking(true);
                    }}
                    className="py-3 bg-brand/10 border border-brand/20 text-brand rounded-2xl text-xs font-bold font-arabic hover:bg-brand/20 transition-all"
                  >
                    تعديل التفاصيل
                  </button>
                  <button 
                    onClick={() => currentBooking && confirm('هل انتهى اللقاء وتريد أرشفة الحجز؟') && completeBooking(currentBooking.id)}
                    className="py-3 bg-brand text-background rounded-2xl text-xs font-bold font-arabic hover:opacity-90 transition-all shadow-lg shadow-brand/20"
                  >
                    إنهاء وأرشفة
                  </button>
                </div>

                {currentBooking && (
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        const reason = prompt('يرجى كتابة سبب الإلغاء لإخطار الجميع:');
                        if (reason) cancelBooking(currentBooking.id, reason);
                      }}
                      className="w-full py-3 bg-danger/10 text-danger border border-danger/20 rounded-2xl text-xs font-bold font-arabic hover:bg-danger/20 transition-all"
                    >
                      إلغاء المباراة لهذا الأسبوع
                    </button>
                    <button 
                      onClick={() => confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟') && deleteBooking(currentBooking.id)}
                      className="w-full py-2 bg-danger/5 text-danger/40 rounded-xl text-[10px] font-bold font-arabic hover:bg-danger/10 transition-colors border border-transparent hover:border-danger/20"
                    >
                      حذف الحجز كلياً من القائمة
                    </button>
                  </div>
                )}
              </div>
            )}
          </AdminSection>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
             <ActionButton 
                icon={RefreshCw} 
                label="تصويت حجز" 
                color="brand" 
                onClick={handleProposalPoll}
                description="تصويت للشباب"
             />
             <ActionButton 
                icon={Bell} 
                label="تذكير سريع" 
                color="brand" 
                onClick={handleReminder}
                description="تنبيه للجميع"
             />
             <ActionButton 
                icon={XCircle} 
                label="إلغاء الحجز" 
                color="danger" 
                onClick={handleCancelMatch}
                description="إلغاء هذا الموعد"
             />
          </div>
 
          {/* App Customization Section */}
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Waves size={18} />
              </div>
              <h3 className="font-bold font-arabic text-sm">تخصيص التطبيق</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-brand" />
                  <span className="text-xs font-bold font-arabic text-white/60">صورة شاشة الدخول</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={loginImageInput} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={loginImageInput}
                      onChange={(e) => setLoginImageInput(e.target.value)}
                      placeholder="رابط الصورة (URL)"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none focus:border-brand/40"
                    />
                    <button 
                      onClick={() => {
                        updateAppConfig({ loginImageUrl: loginImageInput });
                        alert('تم تحديث صورة شاشة الدخول بنجاح!');
                      }}
                      className="w-full py-2 bg-brand text-background rounded-xl text-[10px] font-bold font-arabic hover:opacity-90 transition-opacity"
                    >
                      تحديث الصورة
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-white/20 font-arabic leading-relaxed">
                  * يرجى استخدام رابط مباشر للصورة ليتم عرضها في صفحة تسجيل الدخول.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-1 border border-white/5">
            <button 
                onClick={() => setManagingPlayers(true)}
                className="w-full flex items-center justify-between p-5 bg-brand/5 rounded-[22px] border border-brand/10 group hover:border-brand/40 transition-all font-arabic"
            >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand rounded-2xl shadow-lg shadow-brand/20 text-background">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-white group-hover:text-brand transition-colors">إدارة اللاعبين والمسؤولين</h4>
                    <p className="text-[10px] text-white/40">تعديل البيانات، تعيين مشرفين، إضافة أشخاص</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/20 group-hover:text-brand transition-colors" />
            </button>
          </div>

          {/* Reset Week - Warning Zone */}
          {user?.isAdmin && (
            <div className="pt-8 border-t border-white/5">
               <div className="bg-danger/5 border border-danger/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-danger">
                     <RefreshCw size={24} />
                     <h4 className="font-bold font-arabic">إعادة تعيين الأسبوع</h4>
                  </div>
                  <p className="text-xs text-danger/60 font-arabic mb-6 leading-relaxed">
                     هذا الزر سيقوم بمسح كافة بيانات الحضور والغياب، ومسح الدردشة، وتجهيز النظام للأسبوع القادم. تأكد من استخدامه فقط بعد انتهاء اللقاء.
                  </p>
                  <button 
                    onClick={() => confirm('هل أنت متأكد من إعادة ضبط الأسبوع بالكامل؟') && resetWeek()}
                    className="w-full py-4 bg-danger/20 text-danger border border-danger/30 rounded-2xl font-black font-arabic hover:bg-danger/30 transition-all"
                  >
                     بدء أسبوع جديد (Reset)
                  </button>
               </div>
            </div>
          )}
        </div>
      ) : (
        <PlayerManagementView onBack={() => setManagingPlayers(false)} />
      )}
    </div>
  );
}

function AdminSection({ title, icon: Icon, children, color = 'brand' }: any) {
  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "p-2 rounded-lg",
          color === 'brand' ? "bg-brand/10 text-brand" : "bg-blue-400/10 text-blue-400"
        )}>
          <Icon size={18} />
        </div>
        <h3 className="font-bold font-arabic text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, description }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all text-center",
        color === 'brand' ? "bg-brand/5 border-brand/20 text-brand" : "bg-danger/5 border-danger/20 text-danger"
      )}
    >
      <Icon size={24} />
      <span className="text-xs font-bold font-arabic">{label}</span>
      <span className="text-[8px] opacity-60 font-arabic">{description}</span>
    </button>
  );
}

function Input({ label, onChange, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-white/40 font-arabic px-2">{label}</label>
      <input 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-arabic focus:border-brand/40 outline-none transition-colors"
        onChange={(e) => onChange?.(e.target.value)}
        {...props} 
      />
    </div>
  );
}

function PlayerManagementView({ onBack }: { onBack: () => void }) {
  const { 
    players, 
    user, 
    promoteToAdmin: storePromoteToAdmin, 
    demoteFromAdmin: storeDemoteFromAdmin, 
    updatePlayerPhone, 
    updatePlayerPin, 
    updatePlayer: storeUpdatePlayer, 
    addPlayer, 
    removePlayer, 
    attendance, 
    markAttendance, 
    removeAttendance, 
    activeBookingId,
    setViewingPlayerId
  } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'admins' | 'players'>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editPin, setEditPin] = useState('');
  
  // New player form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Get current attendance map
  const attendanceMap = attendance.reduce((acc, curr) => {
     if (curr.bookingId === activeBookingId) {
       acc[curr.playerId] = curr.status;
     }
     return acc;
  }, {} as Record<string, string>);

  const handleStartEdit = (player: any) => {
    setEditingId(player.id);
    setEditPhone(player.phone);
    setEditPin(player.pin);
  };

  const handleSaveEdit = (id: string) => {
    if (editPin.length !== 6) {
      alert('يجب أن يتكون الرمز من 6 أرقام');
      return;
    }
    
    // Check for uniqueness if PIN changed
    const player = players.find(p => p.id === id);
    if (player && player.pin !== editPin) {
      const isTaken = players.some(p => p.pin === editPin && p.id !== id);
      if (isTaken) {
        alert('هذا الرمز مستخدم بالفعل من قبل شخص آخر.');
        return;
      }
      updatePlayerPin(id, editPin);
    }
    
    if (player && player.phone !== editPhone) {
      updatePlayerPhone(id, editPhone);
    }
    
    setEditingId(null);
  };

  const handleCreatePlayer = () => {
    if (!newName || !newPhone || newPin.length !== 6) {
      alert('يرجى إكمال البيانات والتأكد أن الرمز 6 أرقام');
      return;
    }

    const isTaken = players.some(p => p.pin === newPin);
    if (isTaken) {
      alert('هذا الرمز مستخدم بالفعل. يرجى اختيار رمز آخر.');
      return;
    }
    
    addPlayer({
      name: newName,
      phone: newPhone,
      pin: newPin,
      isAdmin,
      isVerified: isAdmin,
      rating: { speed: 5, shooting: 5, passing: 5, defense: 5, overall: 5 },
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`
    });

    setNewName('');
    setNewPhone('');
    setNewPin('');
    setIsAdmin(false);
    setShowAddForm(false);
  };

  const filteredPlayers = players.filter(p => {
    const matchesFilter = filter === 'admins' ? p.isAdmin : filter === 'players' ? !p.isAdmin : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const canManagePlayer = (target: any) => {
    if (user?.isSuperAdmin) return true;
    if (target.isAdmin || target.isSuperAdmin) return false;
    return true;
  };

  const [showLineupSettings, setShowLineupSettings] = useState(false);
  const { lineupSettings, updateLineupSettings } = useAppStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 font-arabic hover:text-white transition-colors">
            <ChevronRight className="rotate-180" size={18} />
            <span>العودة للإعدادات</span>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowLineupSettings(!showLineupSettings)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                showLineupSettings ? "bg-brand text-background" : "bg-white/5 text-white/40 border border-white/5"
              )}
              title="إعدادات التقسيمة"
            >
              <Settings2 size={16} />
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-brand text-background px-4 py-2 rounded-xl text-xs font-bold font-arabic shadow-lg shadow-brand/20 active:scale-95 transition-transform"
            >
              <UserPlus2 size={16} />
              شخص جديد
            </button>
          </div>
        </div>

        {showLineupSettings && (
          <div className="bg-card p-6 rounded-3xl border border-brand/20 shadow-xl space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 size={16} className="text-brand" />
              <h3 className="font-bold font-arabic text-sm">إعدادات توزيع الفرق (التقسيمة)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-arabic px-2">عدد اللاعبين في كل فريق</label>
                <select 
                  value={lineupSettings.playersPerTeam}
                  onChange={(e) => updateLineupSettings({ playersPerTeam: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-arabic focus:border-brand/40 outline-none"
                >
                  <option value={5}>5 لاعبين</option>
                  <option value={6}>6 لاعبين</option>
                  <option value={7}>7 لاعبين</option>
                  <option value={8}>8 لاعبين</option>
                  <option value={9}>9 لاعبين</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-arabic px-2">طريقة التوزيع</label>
                <select 
                  value={lineupSettings.method}
                  onChange={(e) => updateLineupSettings({ method: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-arabic focus:border-brand/40 outline-none"
                >
                  <option value="rating">توزيع متوازن (حسب المستوى)</option>
                  <option value="random">توزيع عشوائي (بالقرعة)</option>
                </select>
              </div>
              <div className="col-span-2 p-3 bg-brand/5 rounded-2xl border border-brand/10">
                <p className="text-[10px] text-brand font-arabic leading-relaxed">
                  * سيقوم النظام تلقائياً بتقسيم اللاعبين الحاضرين إلى فريقين متساويين في العدد. 
                  إذا كان العدد فردياً، سيتم وضع اللاعب الزائد في الفريق صاحب التقييم الأقل لضمان التوازن.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن لاعب بالاسم أو الرقم..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-sm font-arabic focus:border-brand/40 outline-none transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
            <UserPlus size={18} />
          </div>
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card p-6 rounded-3xl border border-brand/20 shadow-2xl space-y-4 mb-6 ring-1 ring-brand/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-brand/10 rounded-lg text-brand">
              <UserPlus2 size={16} />
            </div>
            <h3 className="font-bold font-arabic text-sm text-white">إضافة لاعب جديد للمجموعة</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <Input label="الاسم الكامل" value={newName} onChange={setNewName} placeholder="أحمد محمد" />
             <Input label="رقم الهاتف" value={newPhone} onChange={setNewPhone} placeholder="05xxxxxxxx" />
          </div>
          <Input label="رمز الدخول (6 أرقام)" value={newPin} onChange={setNewPin} placeholder="123456" maxLength={6} />
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <input 
              type="checkbox" 
              id="is-admin-check"
              checked={isAdmin} 
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-brand focus:ring-brand accent-brand"
            />
            <label htmlFor="is-admin-check" className="text-xs font-arabic text-white/60 cursor-pointer">
              منح هذا الشخص صلاحيات <span className="text-brand font-bold">مسؤول (مشرف)</span> المجموعة
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setShowAddForm(false)} className="py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-arabic font-medium hover:bg-white/10 transition-colors">إلغاء</button>
            <button onClick={handleCreatePlayer} className="py-3 bg-brand text-background rounded-2xl text-xs font-black font-arabic shadow-lg shadow-brand/20 active:scale-95 transition-transform">تأكيد الإضافة</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'admins', label: 'المسؤولين' },
          { id: 'players', label: 'اللاعبين' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={cn(
              "whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-bold font-arabic transition-all",
              filter === tab.id 
                ? "bg-brand text-background shadow-lg shadow-brand/20 ring-1 ring-brand/50" 
                : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="py-12 text-center space-y-3 opacity-20">
            <div className="flex justify-center">
              <UserPlus size={48} />
            </div>
            <p className="font-arabic text-sm">لا يوجد نتائج تطابق بحثك</p>
          </div>
        ) : filteredPlayers.map(player => (
          <div 
            key={player.id} 
            className={cn(
              "group bg-card rounded-3xl p-5 border transition-all duration-300",
              player.isAdmin ? "border-brand/10 bg-gradient-to-br from-card to-brand/[0.02]" : "border-white/5",
              editingId === player.id && "ring-2 ring-brand/50 border-brand"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={player.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-brand/30 transition-colors" alt="" />
                  {player.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-brand text-background rounded-lg p-0.5 shadow-lg border-2 border-background">
                      <BadgeCheck size={12} />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                   <h4 className="text-base font-bold font-arabic flex items-center gap-2 text-white">
                     {player.name}
                     {player.isAdmin && (
                        <div className="flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded-lg text-[10px] ring-1 ring-brand/20">
                          <ShieldCheck size={10} />
                          <span>{player.isSuperAdmin ? 'مشرف أساسي' : 'مشرف'}</span>
                        </div>
                     )}
                   </h4>
                   
                   {editingId === player.id ? (
                     <div className="grid grid-cols-2 gap-2 w-full max-w-[250px] pt-1">
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-arabic px-1">رقم الهاتف</label>
                          <input 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono outline-none focus:border-brand"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-white/40 font-arabic px-1">الرمز (6 أرقام)</label>
                          <input 
                            value={editPin} 
                            maxLength={6}
                            onChange={(e) => setEditPin(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono outline-none focus:border-brand"
                          />
                        </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                       <p className="text-xs text-white/40 font-mono flex items-center gap-1">
                         <Phone size={10} className="opacity-40" />
                         {player.phone}
                       </p>
                       <p className="text-xs text-brand/60 font-mono flex items-center gap-1">
                         <Lock size={10} className="opacity-40" />
                         {player.pin}
                       </p>
                     </div>
                   )}
                </div>
              </div>

              <div className="flex gap-2 self-end sm:self-center">
                  {editingId === player.id ? (
                    <>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleSaveEdit(player.id)}
                        className="p-2.5 bg-brand text-background rounded-xl font-bold"
                      >
                        حفظ
                      </button>
                    </>
                  ) : (
                    <>
                      {user?.isAdmin && !player.isVerified && (
                        <button 
                          onClick={() => {
                            if (confirm(`هل تريد توثيق ${player.name}؟`)) {
                              storeUpdatePlayer(player.id, { isVerified: true });
                            }
                          }}
                          className="p-2.5 bg-brand/10 rounded-xl text-brand hover:bg-brand hover:text-background transition-all"
                          title="توثيق اللاعب"
                        >
                          <BadgeCheck size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => setViewingPlayerId(player.id)}
                        className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-brand hover:bg-brand/5 transition-all"
                        title="عرض الملف"
                      >
                        <UserCog size={16} />
                      </button>
                      <button 
                        disabled={!canManagePlayer(player)}
                        onClick={() => canManagePlayer(player) && handleStartEdit(player)}
                        className={cn(
                          "p-2.5 rounded-xl text-white/40 hover:text-brand hover:bg-brand/5 transition-all",
                          !canManagePlayer(player) ? "opacity-20 cursor-not-allowed" : "bg-white/5"
                        )}
                        title="تعديل البيانات"
                      >
                        <Settings2 size={16} />
                      </button>
                      
                      {/* Admin Privileges: Promote/Demote */}
                      {user?.isAdmin && (
                        <>
                          {!player.isAdmin ? (
                            <button 
                              onClick={() => {
                                if (confirm(`هل تريد منح ${player.name} صلاحيات مسؤول؟`)) {
                                  storePromoteToAdmin(player.id);
                                }
                              }}
                              className="p-2.5 bg-brand/10 rounded-xl text-brand hover:bg-brand hover:text-background transition-all"
                              title="ترقية لمسؤول"
                            >
                              <ShieldCheck size={16} />
                            </button>
                          ) : (user?.isSuperAdmin && !player.isSuperAdmin) ? (
                            <button 
                              onClick={() => {
                                if (confirm(`هل تريد سحب صلاحيات المسؤول من ${player.name}؟`)) {
                                  storeDemoteFromAdmin(player.id);
                                }
                              }}
                              className="p-2.5 bg-danger/10 rounded-xl text-danger hover:bg-danger hover:text-white transition-all"
                              title="سحب الإشراف"
                            >
                              <XCircle size={16} />
                            </button>
                          ) : null}
                        </>
                      )}

                      <button 
                        disabled={!canManagePlayer(player) || player.id === user?.id}
                        onClick={() => confirm(`هل أنت متأكد من حذف ${player.name}؟`) && removePlayer(player.id)}
                        className={cn(
                          "p-2.5 rounded-xl text-danger hover:bg-danger hover:text-white transition-all",
                          (!canManagePlayer(player) || player.id === user?.id) ? "opacity-20 cursor-not-allowed" : "bg-danger/10"
                        )}
                        title="حذف الشخص"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
            </div>

            {activeBookingId && (
              <div className="mt-5 flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-brand/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-[10px] text-white/40 font-arabic">سجل الحضور لهذا الأسبوع</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        if (attendanceMap[player.id] === 'حاضر') {
                            removeAttendance(activeBookingId, player.id);
                        } else {
                            markAttendance(activeBookingId, player.id, 'حاضر');
                        }
                    }}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[10px] font-bold font-arabic transition-all flex items-center gap-2 active:scale-95",
                      attendanceMap[player.id] === 'حاضر' ? "bg-brand text-background shadow-lg shadow-brand/20" : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                    )}
                  >
                    <ShieldCheck size={12} />
                    حاضر
                  </button>
                  <button 
                    onClick={() => {
                        if (attendanceMap[player.id] === 'غائب') {
                            removeAttendance(activeBookingId, player.id);
                        } else {
                            markAttendance(activeBookingId, player.id, 'غائب');
                        }
                    }}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[10px] font-bold font-arabic transition-all flex items-center gap-2 active:scale-95",
                      attendanceMap[player.id] === 'غائب' ? "bg-danger text-white shadow-lg shadow-danger/20" : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                    )}
                  >
                    <XCircle size={12} />
                    غائب
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
