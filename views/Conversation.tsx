
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, User, Cpu } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';

const LANG_CODES: Record<string, string> = {
    'English': 'en-GB', // Changed to British English for Cambridge C1/C2
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'Italian': 'it-IT'
};

export const Conversation: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('En espera...');
    const recognitionRef = useRef<any>(null);

    const profile = StorageService.getProfile();
    const level = profile.level || 'C1';
    const language = profile.targetLanguage || 'English';

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.lang = LANG_CODES[language] || 'en-GB';
            recognition.interimResults = false;

            recognition.onstart = () => {
                setStatus('Escuchando...');
            };

            recognition.onresult = async (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                setStatus('Procesando respuesta...');
                setIsListening(false);
                
                // Send to AI
                const aiResponse = await GeminiService.chatConversation(text, level, language);
                setResponse(aiResponse);
                setStatus('Respondiendo...');
                speak(aiResponse);
            };

            recognition.onerror = (event: any) => {
                console.error(event.error);
                setStatus('Error de micrófono. Inténtalo de nuevo.');
                setIsListening(false);
            };

            recognition.onend = () => {
                if (status === 'Escuchando...') setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setStatus('Tu navegador no soporta reconocimiento de voz.');
        }
    }, [level, language]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setStatus('Detenido.');
        } else {
            setTranscript('');
            setResponse('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANG_CODES[language] || 'en-GB';
        utterance.rate = 1;
        utterance.onend = () => setStatus('En espera...');
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative animate-fade-in">
            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>
            
            {/* Header */}
            <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <h2 className="text-white font-mono uppercase tracking-widest text-sm">Comms Uplink // {language} {level}</h2>
                </div>
                <div className="text-sky-400 font-mono text-xs">{status}</div>
            </div>

            {/* Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-8 gap-8">
                 {/* AI Avatar */}
                 <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-[0_0_30px_rgba(56,189,248,0.5)] ${status === 'Respondiendo...' ? 'border-sky-400 scale-110' : 'border-slate-600'}`}>
                     <Cpu size={48} className={`text-sky-400 ${status === 'Respondiendo...' ? 'animate-pulse' : ''}`} />
                 </div>

                 {/* Waveform Animation (CSS only for simplicity) */}
                 {isListening && (
                     <div className="flex items-center gap-1 h-12">
                         {[...Array(10)].map((_, i) => (
                             <div key={i} className="w-1 bg-green-500 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s`, height: '20%' }}></div>
                         ))}
                     </div>
                 )}

                 {/* Transcription Text */}
                 <div className="w-full space-y-4 z-10">
                     {transcript && (
                         <div className="flex justify-end">
                             <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                                 <p className="text-sm font-medium">{transcript}</p>
                             </div>
                         </div>
                     )}
                     
                     {response && (
                         <div className="flex justify-start">
                             <div className="bg-slate-700 text-sky-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-slate-600 shadow-lg">
                                 <p className="text-sm font-medium">{response}</p>
                             </div>
                         </div>
                     )}
                 </div>
            </div>

            {/* Controls */}
            <div className="p-8 bg-slate-800 border-t border-slate-700 flex justify-center z-10">
                <button 
                    onClick={toggleListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50' : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/50'}`}
                >
                    {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                </button>
            </div>
            
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
                .animate-wave {
                    animation: wave 1s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};
