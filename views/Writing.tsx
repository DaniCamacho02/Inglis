
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { Send, Loader2, FileText } from 'lucide-react';

export const Writing: React.FC = () => {
  const [text, setText] = useState('');
  const [type, setType] = useState('Essay');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (text.length < 50) {
        alert("Muy corto. Escribe al menos 50 caracteres.");
        return;
    }
    setLoading(true);
    try {
        const feedback = await GeminiService.evaluateWriting(text, type);
        setResult(feedback);
        StorageService.saveWriting({
            id: Date.now().toString(),
            type,
            originalText: text,
            correctedText: feedback.correctedText,
            score: feedback.score,
            feedback: feedback.feedback,
            date: new Date().toISOString()
        });
    } catch (e) {
        alert("Error en la evaluación.");
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex gap-4">
            <div className="w-1/3 rounded-xl overflow-hidden shadow-sm hidden md:block relative">
                <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white font-serif italic text-sm text-center px-2">"The art of writing is the art of discovering what you believe."</span>
                </div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">Format</label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 w-full focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                >
                    <option>Essay</option>
                    <option>Report</option>
                    <option>Proposal</option>
                    <option>Review</option>
                    <option>Formal Letter</option>
                </select>
            </div>
        </div>
        
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Empieza a escribir tu texto C1 aquí... Focus Mode ON."
            className="flex-1 bg-white border border-slate-200 rounded-xl p-6 text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none resize-none font-serif leading-relaxed text-lg shadow-sm placeholder-slate-300 transition-shadow focus:shadow-md"
            style={{ minHeight: '400px' }}
        />
        
        <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-orange-200 hover:-translate-y-1"
        >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            ENVIAR AL EXAMINADOR
        </button>
      </div>

      {/* Result Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto relative shadow-sm h-full">
        {!result ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                    <FileText size={48} />
                </div>
                <p className="font-medium text-sm">El feedback del examinador aparecerá aquí.</p>
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Resultado Oficial</h3>
                    <div className={`text-3xl font-black ${result.score >= 12 ? 'text-green-500' : 'text-red-500'}`}>
                        {result.score}/20
                    </div>
                </div>

                <div>
                    <h4 className="text-orange-600 font-bold mb-2 text-xs uppercase tracking-wider">Feedback Detallado</h4>
                    <div className="bg-orange-50 text-slate-700 leading-relaxed p-4 rounded-lg border border-orange-100 text-sm">
                        {result.feedback}
                    </div>
                </div>

                <div>
                    <h4 className="text-green-600 font-bold mb-2 text-xs uppercase tracking-wider">Versión C1 Nativa</h4>
                    <div className="bg-green-50 border border-green-100 p-6 rounded-lg text-slate-800 font-serif whitespace-pre-wrap leading-7 shadow-inner">
                        {result.correctedText}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};