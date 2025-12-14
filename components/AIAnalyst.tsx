import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { analyzeMarket } from '../services/geminiService';
import { PricePoint } from '../types';

interface AIAnalystProps {
  priceHistory: PricePoint[];
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ priceHistory }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeMarket(priceHistory);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="mb-6">
       {!analysis ? (
         <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-md flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Analyzing Market...' : 'Ask AI Analyst'}
        </button>
       ) : (
         <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl relative animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-1">Gemini Market Insight</h4>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  {analysis}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setAnalysis(null)}
              className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-500"
            >
              ×
            </button>
         </div>
       )}
    </div>
  );
};

export default AIAnalyst;
