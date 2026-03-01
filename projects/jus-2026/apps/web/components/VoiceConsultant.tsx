import React, { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import AnimatedButton from './AnimatedButton';

interface VoiceConsultantProps {
  onClose: () => void;
}

export default function VoiceConsultant({ onClose }: VoiceConsultantProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0); // Para o visualizador
  const [error, setError] = useState<string | null>(null);

  // Refs para controle de áudio e sessão
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // Inicialização
  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        if (!process.env.API_KEY) {
            throw new Error("Chave de API não configurada.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Setup Audio Context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Stream do Microfone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Visualizador Setup (Analyser)
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Input Pipeline
        const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = inputContext.createMediaStreamSource(stream);

        // Conecta ao analyser para visualização (apenas visual, não envia pro modelo aqui)
        // Precisamos clonar ou usar o mesmo contexto se a taxa de amostragem permitisse,
        // mas para simplificar o visualizador usará um analyser separado ou mockado pelo volume.
        // Vamos usar um ScriptProcessor para capturar o áudio raw para o modelo.

        const processor = inputContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (isMuted) return;

            const inputData = e.inputBuffer.getChannelData(0);

            // Calculando volume para visualizador
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            setVolume(Math.min(rms * 5, 1)); // Amplifica para visualização

            // Enviar para API
            if (sessionRef.current) {
                const b64Data = arrayBufferToBase64(float32ToInt16(inputData));
                sessionRef.current.sendRealtimeInput({
                    media: {
                        mimeType: "audio/pcm;rate=16000",
                        data: b64Data
                    }
                });
            }
        };

        source.connect(processor);
        processor.connect(inputContext.destination); // Necessário para o script processor rodar

        inputSourceRef.current = source;
        processorRef.current = processor;

        // Conectar ao Gemini Live
        const session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: {
                    parts: [{ text: "Você é um consultor jurídico sênior, experiente e calmo. Responda de forma concisa, direta e profissional, como se estivesse em uma reunião estratégica com outro advogado. Fale português do Brasil." }]
                },
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            },
            callbacks: {
                onopen: () => {
                    if (mounted) setIsConnected(true);
                    console.log("Gemini Live Connected");
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        await playAudioChunk(audioData);
                        // Simula atividade visual da IA
                        setVolume(0.5 + Math.random() * 0.5);
                    }

                    if (msg.serverContent?.turnComplete) {
                        setVolume(0); // Silêncio
                    }
                },
                onclose: () => {
                    if (mounted) setIsConnected(false);
                    console.log("Session Closed");
                },
                onerror: (err) => {
                    console.error(err);
                    setError("Erro na conexão de voz.");
                }
            }
        });

        sessionRef.current = session;

      } catch (err: any) {
        console.error("Setup Error", err);
        setError(err.message || "Erro ao iniciar áudio.");
      }
    };

    startSession();

    return () => {
        mounted = false;
        // Cleanup
        sourcesRef.current.forEach(s => s.stop());
        processorRef.current?.disconnect();
        inputSourceRef.current?.disconnect();
        audioContextRef.current?.close();
        // Não há método session.close() explícito documentado no SDK types fornecidos,
        // mas é boa prática fechar se existir ou apenas desconectar.
        // Assumindo desconexão automática ou refresh.
    };
  }, []);

  // Helpers de Áudio
  function float32ToInt16(float32: Float32Array) {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16.buffer;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async function playAudioChunk(base64Audio: string) {
    if (!audioContextRef.current) return;

    const arrayBuffer = base64ToArrayBuffer(base64Audio);

    // Decodificação Manual PCM 24kHz (Assumindo que o modelo retorna PCM 16bit LE 24kHz)
    // O SDK retorna RAW PCM.
    const int16Data = new Int16Array(arrayBuffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    // Agendamento sem gap
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    source.onended = () => {
        sourcesRef.current.delete(source);
    };
    sourcesRef.current.add(source);
  }

  // Visualizer Animation
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;

      const draw = () => {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const barCount = 30;
          const barWidth = 6;
          const spacing = 4;
          const centerX = width / 2;

          ctx.fillStyle = isConnected ? '#10b981' : '#64748b'; // Emerald or Slate

          for (let i = 0; i < barCount; i++) {
              // Simula ondas baseadas no volume
              const dist = Math.abs(i - barCount/2);
              const heightMod = Math.max(0.1, 1 - dist/10);
              const barHeight = 10 + (volume * 100 * heightMod * (0.8 + Math.random()*0.4));

              const x = centerX + (i - barCount/2) * (barWidth + spacing);
              const y = (height - barHeight) / 2;

              ctx.beginPath();
              ctx.roundRect(x, y, barWidth, barHeight, 10);
              ctx.fill();
          }

          animationId = requestAnimationFrame(draw);
      };

      draw();
      return () => cancelAnimationFrame(animationId);
  }, [volume, isConnected]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in-up">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 flex flex-col items-center relative overflow-hidden">

            {/* Glow Effect */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-all duration-500 ${isConnected ? 'bg-emerald-500/20' : 'bg-red-500/10'}`}></div>

            <div className="flex justify-between w-full mb-8 z-10">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-slate-400 text-xs font-bold tracking-wider uppercase">
                        {isConnected ? "Conectado • Gemini Live" : "Desconectado"}
                    </span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <Icons.X className="w-5 h-5" />
                </button>
            </div>

            <div className="relative z-10 mb-8 w-full h-32 flex items-center justify-center">
                <canvas ref={canvasRef} width={320} height={120} className="w-full h-full" />
            </div>

            <div className="text-center z-10 mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Consultor Jurídico</h3>
                <p className="text-slate-400 text-sm">Fale naturalmente. A IA está ouvindo.</p>
                {error && <p className="text-red-400 text-xs mt-2 bg-red-900/30 px-3 py-1 rounded-full inline-block">{error}</p>}
            </div>

            <div className="flex space-x-6 z-10">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-all duration-200 ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                    {isMuted ? <Icons.MicOff className="w-6 h-6" /> : <Icons.Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={onClose}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/50 scale-110 hover:scale-125 transition-all duration-200"
                >
                    <Icons.PhoneOff className="w-6 h-6" />
                </button>

                <button
                    onClick={() => { /* Placeholder for interrupt logic */ sourcesRef.current.forEach(s => s.stop()); nextStartTimeRef.current = audioContextRef.current?.currentTime || 0; }}
                    className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all duration-200"
                    title="Interromper fala da IA"
                >
                    <Icons.Square className="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>
    </div>
  );
}