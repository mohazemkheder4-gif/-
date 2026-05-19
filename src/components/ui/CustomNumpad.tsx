import React from 'react';
import { Delete, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  maxLength?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'confirm'];

export function CustomNumpad({ value, onChange, onConfirm, maxLength = 6 }: Props) {
  const handlePress = (key: string) => {
    if (key === 'delete') {
      onChange(value.slice(0, -1));
    } else if (key === 'confirm') {
      if (value.length === maxLength) onConfirm();
    } else {
      if (value.length < maxLength) onChange(value + key);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* dots show current pin length */}
      <div className="flex gap-4">
        {Array.from({ length: maxLength }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i < value.length ? 1.2 : 1,
              backgroundColor: i < value.length ? 'var(--color-brand)' : 'transparent',
            }}
            className={cn(
              "w-4 h-4 rounded-full border-2 border-brand",
              i < value.length && "bg-brand"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-[300px]">
        {KEYS.map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePress(key)}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-colors",
              key === 'confirm' ? "bg-brand text-background" : "bg-card text-white border border-white/5 hover:border-brand/50",
              key === 'delete' && "text-danger"
            )}
          >
            {key === 'delete' ? <Delete size={24} /> : 
             key === 'confirm' ? <Check size={28} /> : 
             key}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
