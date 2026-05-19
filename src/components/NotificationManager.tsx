import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function NotificationManager() {
  const { bookings, sendMessage, user } = useAppStore();
  const sentNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkTimers = () => {
      const now = new Date();
      
      bookings.forEach(booking => {
        if (booking.status !== 'مفتوح') return;

        const startTime = new Date(`${booking.matchDate}T${booking.matchTime}:00`);
        const endTime = new Date(`${booking.matchDate}T${booking.matchEndTime}:00`);
        const diffStartMinutes = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60));
        const diffEndMinutes = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));

        // 1 hour reminder (60 min)
        if (diffStartMinutes === 60 && !sentNotifications.current.has(`${booking.id}-60`)) {
          sendMessage(`⏳ يا شباب باقي ساعة على التقسيمة! جهزوا حالكم يا وحوش ⚽🔥`, 'text');
          sentNotifications.current.add(`${booking.id}-60`);
        }

        // 30 min reminder
        if (diffStartMinutes === 30 && !sentNotifications.current.has(`${booking.id}-30`)) {
          sendMessage(`🏃‍♂️ باقي 30 دقيقة فقط! اللي لسا في الطريق يشد حيله 🚀🔋`, 'text');
          sentNotifications.current.add(`${booking.id}-30`);
        }

        // End of match
        if (diffEndMinutes <= 0 && diffEndMinutes > -5 && !sentNotifications.current.has(`${booking.id}-ended`)) {
          sendMessage(`🔚 انتهت التقسيمة! يعطكم العافية جميعاً.. ننتظركم في الموعد القادم ❤️👏`, 'text');
          sentNotifications.current.add(`${booking.id}-ended`);
        }
      });
    };

    const interval = setInterval(checkTimers, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [bookings, sendMessage]);

  return null;
}
