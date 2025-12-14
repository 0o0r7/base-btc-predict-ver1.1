import React, { useMemo } from 'react';
import { Round, Position } from '../types';
import { COLORS } from '../constants';
import { ArrowUp, ArrowDown, Clock, Lock } from 'lucide-react';

interface RoundCardProps {
  round: Round;
  currentPrice: number;
  onPredict: (position: Position) => void;
  isPredicting: boolean;
  hasPredicted: boolean;
  userPosition?: Position;
}

const RoundCard: React.FC<RoundCardProps> = ({ 
  round, 
  currentPrice, 
  onPredict, 
  isPredicting, 
  hasPredicted,
  userPosition 
}) => {
  
  const timeLeft = useMemo(() => {
    const now = Date.now();
    if (round.status === 'OPEN') return Math.max(0, round.lockTime - now);
    if (round.status === 'LOCKED') return Math.max(0, round.endTime - now);
    return 0;
  }, [round]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isUpWinning = round.lockPrice && currentPrice > round.lockPrice;
  const isDownWinning = round.lockPrice && currentPrice < round.lockPrice;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-[#0052FF] overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#0052FF] text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {round.status === 'OPEN' ? <Clock size={16} /> : <Lock size={16} />}
          <span className="font-semibold text-sm">
            {round.status === 'OPEN' ? 'Accepting Predictions' : 'Round Live'}
          </span>
        </div>
        <div className="font-mono font-bold">
          #{round.id}
        </div>
      </div>

      {/* Timer Bar */}
      {round.status !== 'ENDED' && (
        <div className="bg-blue-900 p-2 text-center text-white text-xs font-mono">
          Closing in: <span className="text-lg font-bold mx-1">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        
        {/* Price Info */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <div className="text-gray-500">
            Prize Pool
            <div className="text-gray-900 font-bold text-lg">{round.totalPool.toFixed(6)} ETH</div>
          </div>
          <div className="text-right text-gray-500">
            {round.status === 'OPEN' ? 'Current Price' : 'Locked Price'}
            <div className="text-gray-900 font-bold text-lg">
              ${(round.status === 'OPEN' ? currentPrice : round.lockPrice)?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Area */}
        {round.status === 'OPEN' ? (
          <div className="flex gap-3">
            <button
              onClick={() => onPredict(Position.UP)}
              disabled={isPredicting || hasPredicted}
              className={`flex-1 p-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                ${hasPredicted && userPosition === Position.UP ? 'bg-green-600 text-white ring-2 ring-green-600 ring-offset-2' : ''}
                ${!hasPredicted ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' : ''}
                ${hasPredicted && userPosition !== Position.UP ? 'bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ArrowUp size={24} className={hasPredicted && userPosition === Position.UP ? 'text-white' : 'text-green-600'} />
              <span className="font-bold">UP</span>
              <span className="text-xs opacity-80">Enter UP</span>
            </button>

            <button
              onClick={() => onPredict(Position.DOWN)}
              disabled={isPredicting || hasPredicted}
              className={`flex-1 p-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                ${hasPredicted && userPosition === Position.DOWN ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2' : ''}
                ${!hasPredicted ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' : ''}
                ${hasPredicted && userPosition !== Position.DOWN ? 'bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ArrowDown size={24} className={hasPredicted && userPosition === Position.DOWN ? 'text-white' : 'text-red-600'} />
              <span className="font-bold">DOWN</span>
              <span className="text-xs opacity-80">Enter DOWN</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className={`p-4 rounded-xl border flex justify-between items-center ${isUpWinning ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-2">
                 <div className={`p-1 rounded ${isUpWinning ? 'bg-green-200' : 'bg-gray-200'}`}><ArrowUp size={16} className={isUpWinning ? 'text-green-700' : 'text-gray-500'} /></div>
                 <span className={`font-bold ${isUpWinning ? 'text-green-800' : 'text-gray-500'}`}>UP</span>
              </div>
              {isUpWinning && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">WINNING</span>}
            </div>
            
            <div className={`p-4 rounded-xl border flex justify-between items-center ${isDownWinning ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-2">
                 <div className={`p-1 rounded ${isDownWinning ? 'bg-red-200' : 'bg-gray-200'}`}><ArrowDown size={16} className={isDownWinning ? 'text-red-700' : 'text-gray-500'} /></div>
                 <span className={`font-bold ${isDownWinning ? 'text-red-800' : 'text-gray-500'}`}>DOWN</span>
              </div>
              {isDownWinning && <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-bold">WINNING</span>}
            </div>
          </div>
        )}
      </div>

       {hasPredicted && round.status === 'OPEN' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-xl z-10 animate-pulse">
          Entered: {userPosition}
        </div>
      )}
    </div>
  );
};

export default RoundCard;
