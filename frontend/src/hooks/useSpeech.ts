import { useState, useRef, useEffect } from 'react';

const langCodeMap: Record<string, string> = {
  'Tamil': 'ta-IN',
  'Hindi': 'hi-IN',
  'Telugu': 'te-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Bengali': 'bn-IN',
  'English': 'en-IN'
};

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, lang: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]+>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = langCodeMap[lang] || 'en-IN';
    utterance.rate = 0.88; // slightly slower
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setProgress(0); };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    // We'll update a simple timer-based progress if needed, or just set 0/100
    // Actually, onboundary event exists, but it's not perfectly reliable. We can use it.
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        setProgress((charIndex / cleanText.length) * 100);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => { window.speechSynthesis.pause(); setIsPaused(true); };
  const resume = () => { window.speechSynthesis.resume(); setIsPaused(false); };
  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setProgress(0);
  };

  return { speak, pause, resume, stop, isSpeaking, isPaused, progress };
};
