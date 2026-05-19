import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { 
  User, 
  Phone, 
  Lock, 
  Camera, 
  ChevronLeft, 
  LogOut, 
  ShieldCheck, 
  Award, 
  TrendingUp,
  Hash,
  Settings2,
  BadgeCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SkillRadar } from '../components/ui/SkillRadar';

export function ProfileScreen() {
  const { user, players, updatePlayer, logout, viewingPlayerId, setViewingPlayerId, setActiveTab } = useAppStore();
  const [editing, setEditing] = useState(false);
  
  // Decide which player to show
  const profilePlayer = viewingPlayerId 
    ? players.find(p => p.id === viewingPlayerId) 
    : user;

  const isOwnProfile = !viewingPlayerId || viewingPlayerId === user?.id;

  const [name, setName] = useState(profilePlayer?.name || '');
  const [phone, setPhone] = useState(profilePlayer?.phone || '');
  const [newPin, setNewPin] = useState('');

  if (!profilePlayer) return null;

  const handleUpdate = () => {
    if (newPin.length > 0 && newPin.length !== 6) {
      alert('يجب أن يتكون الرمز من 6 أرقام');
      return;
    }

    if (newPin.length === 6) {
      // Check for uniqueness
      const isTaken = players.some(p => p.pin === newPin && p.id !== profilePlayer.id);
      if (isTaken) {
        alert('هذا الرمز مستخدم بالفعل من قبل شخص آخر. يرجى اختيار رمز آخر.');
        return;
      }
    }

    updatePlayer(profilePlayer.id, {
       name,
       phone,
       ...(newPin.length === 6 ? { pin: newPin } : {})
    });
    setEditing(false);
    setNewPin('');
    alert('تم تحديث البيانات بنجاح ✅');
  };

  return (
    <div className="pb-24 pt-6 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOwnProfile && (
            <button 
              onClick={() => {
                setViewingPlayerId(null);
                setActiveTab('home');
              }}
              className="p-2 hover:bg-white/5 rounded-full text-white/40"
            >
              <ChevronLeft className="rotate-180" />
            </button>
          )}
          <h2 className="text-2xl font-bold font-arabic flex items-center gap-2">
            <User className="text-brand" />
            {isOwnProfile ? 'الملف الشخصي' : 'عرض الملف'}
          </h2>
        </div>
        {(profilePlayer.isVerified || profilePlayer.isAdmin) && (
           <div className="flex items-center gap-1 bg-brand/10 text-brand px-3 py-1 rounded-full border border-brand/20">
             <BadgeCheck size={16} />
             <span className="text-[10px] font-bold font-arabic">موثق</span>
           </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
           <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-brand/20 p-1 overflow-hidden">
                <img src={profilePlayer.avatarUrl} className="w-full h-full object-cover rounded-full" alt={profilePlayer.name} />
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => {
                    const url = prompt('أدخل رابط الصورة الجديد:', profilePlayer.avatarUrl);
                    if (url) updatePlayer(profilePlayer.id, { avatarUrl: url });
                  }}
                  className="absolute bottom-0 right-0 p-2 bg-brand text-background rounded-full border-4 border-background shadow-xl active:scale-90 transition-transform"
                >
                  <Camera size={20} />
                </button>
              )}
           </div>
           <h3 className="mt-4 text-xl font-bold font-arabic flex items-center gap-2">
             {profilePlayer.name}
             {profilePlayer.isSuperAdmin ? (
               <ShieldCheck size={18} className="text-brand" />
             ) : profilePlayer.isAdmin ? (
               <ShieldCheck size={18} className="text-blue-400" />
             ) : null}
           </h3>
           <p className="text-white/40 text-sm font-arabic">
             {profilePlayer.isSuperAdmin ? 'مشرف أساسي' : profilePlayer.isAdmin ? 'مشرف مجموعة' : 'لاعب فعال'}
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           <StatCard icon={TrendingUp} label="المباريات" value={profilePlayer.stats.matchesPlayed} />
           <StatCard icon={Award} label="رجل المباراة" value={profilePlayer.stats.motmCount} />
        </div>

        {/* Admin Access Button */}
        {profilePlayer.isAdmin && isOwnProfile && (
          <button 
            onClick={() => setActiveTab('admin')}
            className="w-full flex items-center justify-between p-5 bg-brand text-background rounded-3xl shadow-lg shadow-brand/20 active:scale-95 transition-all font-arabic mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background/20">
                <Settings2 size={24} />
              </div>
              <div className="text-right">
                <p className="font-bold text-lg leading-none">لوحة التحكم</p>
                <p className="text-[10px] opacity-70">
                  {profilePlayer.isSuperAdmin ? 'لديك صلاحيات المشرف الأساسي' : 'لديك صلاحيات مشرف المجموعة'}
                </p>
              </div>
            </div>
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        )}

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="space-y-3">
             {editing ? (
               <div className="bg-card rounded-3xl p-6 border border-brand/20 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-arabic text-white/40 px-2">الاسم</label>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-arabic focus:border-brand/40 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-arabic text-white/40 px-2">رقم الهاتف</label>
                    <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-arabic focus:border-brand/40 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-arabic text-white/40 px-2">تغيير رمز الدخول (اختياري - 6 أرقام)</label>
                    <input 
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="******"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono focus:border-brand/40 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                     <button onClick={() => setEditing(false)} className="py-4 bg-white/5 rounded-2xl font-arabic text-sm">إلغاء</button>
                     <button onClick={handleUpdate} className="py-4 bg-brand text-background rounded-2xl font-bold font-arabic text-sm">حفظ التغييرات</button>
                  </div>
               </div>
             ) : (
               <button 
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-white/5 hover:border-brand/30 transition-all font-arabic group"
               >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                      <Lock size={18} />
                    </div>
                    <span>تعديل البيانات الشخصية / الرمز</span>
                  </div>
                  <ChevronLeft size={18} className="text-white/20" />
               </button>
             )}

             <button 
                onClick={() => confirm('هل أنت متأكد من تسجيل الخروج؟') && logout()}
                className="w-full flex items-center justify-between p-4 bg-danger/5 rounded-2xl border border-danger/10 hover:bg-danger/10 transition-all font-arabic text-danger"
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger/10 text-danger">
                    <LogOut size={18} />
                  </div>
                  <span>تسجيل الخروج من الحساب</span>
                </div>
             </button>
          </div>
        )}

        {/* Performance Radar */}
        <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-xl">
           <h4 className="font-bold font-arabic text-center mb-6">رادار المهارات</h4>
           <div className="flex justify-center h-64">
             <SkillRadar rating={profilePlayer.rating} />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2 shadow-sm">
       <Icon size={20} className={cn("text-white/40", color)} />
       <span className="text-2xl font-black font-mono">{value}</span>
       <span className="text-[10px] font-bold font-arabic text-white/40 uppercase tracking-widest">{label}</span>
    </div>
  );
}
