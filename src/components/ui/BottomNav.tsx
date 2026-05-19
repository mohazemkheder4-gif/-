import React from 'react';
import { Home, UserCheck, Users, MessageSquare, History, Settings, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { activeTab, setActiveTab, user, setViewingPlayerId } = useAppStore();

  const navItems = [
    { id: 'profile', label: 'حسابي', icon: User, action: () => { setViewingPlayerId(null); setActiveTab('profile'); } },
    { id: 'history', label: 'السجل', icon: History, action: () => setActiveTab('history') },
    { id: 'chat', label: 'الدردشة', icon: MessageSquare, action: () => setActiveTab('chat') },
    { id: 'lineup', label: 'التشكيلة', icon: Users, action: () => setActiveTab('lineup') },
    { id: 'home', label: 'الرئيسية', icon: Home, action: () => setActiveTab('home') },
  ];

  if (user?.isAdmin) {
    navItems.unshift({ id: 'admin', label: 'الإدارة', icon: Settings, action: () => setActiveTab('admin') });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-white/5 flex items-center justify-around px-2 z-50 safe-paddding-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-brand scale-110" : "text-white/40"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold font-arabic">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
