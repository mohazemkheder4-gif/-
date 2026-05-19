import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CustomNumpad } from '../components/ui/CustomNumpad';
import { useAppStore } from '../store/useAppStore';
import { MessageSquare } from 'lucide-react';

export function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const login = useAppStore(state => state.login);
  const loginImageUrl = useAppStore(state => state.appConfig.loginImageUrl);

  const handleLogin = async () => {
    const success = await login(pin);
    if (!success) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  const handleBiometric = async () => {
    // Simulate biometric check
    const players = useAppStore.getState().players;
    const admin = players.find(p => p.isSuperAdmin) || players[0];
    
    // In a real app, we'd use WebAuthn or similar. 
    // Here we'll just show a quick "authenticating" message or a simple prompt for demo purposes.
    const result = confirm(`هل تريد تسجيل الدخول بالبصمة باسم ${admin.name}؟`);
    if (result) {
      await login(admin.pin);
    }
  };

  React.useEffect(() => {
    // Trigger biometric prompt on mount after a small delay
    const timer = setTimeout(() => {
      handleBiometric();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 mb-8"
      >
        <div className="w-24 h-24 bg-brand rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,200,83,0.3)] mb-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand/40 to-transparent z-10" />
          <img 
            src={loginImageUrl} 
            alt="Logo"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <h1 className="text-3xl font-bold font-arabic text-brand">نجوم الكرة</h1>
        <p className="text-white/60 font-arabic">أدخل رمز الدخول للمتابعة</p>
      </motion.div>

      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <CustomNumpad 
          value={pin} 
          onChange={setPin} 
          onConfirm={handleLogin} 
        />
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <button 
          onClick={() => alert('تواصل مع المسؤول: +966 50 000 0000')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors py-2 px-4 rounded-xl border border-white/5 bg-white/5"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-arabic">نسيت رمز الدخول؟ تواصل معنا</span>
        </button>
      </div>
    </div>
  );
}
