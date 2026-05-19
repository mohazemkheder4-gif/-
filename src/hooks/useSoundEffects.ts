import { useCallback } from 'react';

const SOUNDS = {
  kick: 'https://cdn.pixabay.com/audio/2022/03/10/audio_f5674092d6.mp3', // Soccer kick
  pass: 'https://cdn.pixabay.com/audio/2022/03/10/audio_f5674092d6.mp3', // Reuse kick for pass (shorter)
  tackle: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3496353982.mp3', // Slide
  whistle: 'https://www.soundjay.com/communication/sounds/referee-whistle-01.mp3',
  goal: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', // Goal bell
  success: 'https://www.soundjay.com/button/sounds/button-3.mp3',
};

export function useSoundEffects() {
  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[type]);
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }, []);

  return { playSound };
}
