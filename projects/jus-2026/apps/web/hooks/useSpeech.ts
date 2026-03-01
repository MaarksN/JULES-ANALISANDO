import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSpeechReturn {
  isListening: boolean;
  toggleRecording: () => void;
  transcript: string;
  resetTranscript: () => void;
  supported: boolean;
}

export const useSpeech = (onResult?: (text: string) => void): UseSpeechReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (supported && !recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Permite falar continuamente
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => setIsListening(true);

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);
        if (onResult && finalTranscript) {
             onResult(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [supported, onResult]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isListening, toggleRecording, transcript, resetTranscript, supported };
};