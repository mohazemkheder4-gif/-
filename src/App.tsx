import { useAppStore } from './store/useAppStore';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { BottomNav } from './components/ui/BottomNav';
import { LineupScreen } from './screens/LineupScreen';
import { ChatScreen } from './screens/ChatScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationManager } from './components/NotificationManager';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { isLoggedIn, activeTab } = useAppStore();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'lineup': return <LineupScreen />;
      case 'chat': return <ChatScreen />;
      case 'history': return <ArchiveScreen />;
      case 'admin': return <AdminScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <NotificationManager />
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
