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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string, lang: string) => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const cleanText = text.replace(/<[^>]+>/g, '');
    const targetLang = langCodeMap[lang] || 'en-IN';
    
    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const voice = availableVoices.find(v => v.lang.includes(targetLang) || v.lang.includes(targetLang.split('-')[0]));
    
    // If no local voice is found for a regional language, fallback to Google TTS API
    if (!voice && !targetLang.startsWith('en')) {
      console.warn(`No local voice found for ${targetLang}, falling back to Google TTS API`);
      // Google TTS has a 200 character limit per request, so we take a substring for demo purposes
      // or split, but for this demo a simple URL will work for most short answers.
      const safeText = cleanText.substring(0, 200);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=${targetLang.split('-')[0]}&client=tw-ob`;
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); setProgress(0); };
      audio.onpause = () => setIsPaused(true);
      audio.ontimeupdate = () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      };
      
      audioRef.current = audio;
      audio.play().catch(e => {
        console.error("Google TTS fallback failed:", e);
        setIsSpeaking(false);
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setProgress(0); };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        setProgress((charIndex / cleanText.length) * 100);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => { 
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      window.speechSynthesis.pause(); 
    }
    setIsPaused(true); 
  };
  
  const resume = () => { 
    if (audioRef.current) {
      audioRef.current.play();
    } else {
      window.speechSynthesis.resume(); 
    }
    setIsPaused(false); 
  };
  
  const stop = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setProgress(0);
  };

  return { speak, pause, resume, stop, isSpeaking, isPaused, progress };
};
