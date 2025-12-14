import React from 'react';
import { Round, Position } from '../types';
import { ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';

interface HistoryProps {
  rounds: Round[];
  userPredictions: Record<number, Position>;
}

const History: React.FC<HistoryProps> = ({ rounds, userPredictions }) => {
  if (rounds.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Round History</h3>
      <div className="space-y-3">
        {rounds.map(round => {
           const isWin = round.winner && userPredictions[round.id] === round.winner;
           const userPred = userPredictions[round.id];
           
           return (
            <div key={round.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 text-gray-500 font-mono text-xs px-2 py-1 rounded">
                  #{round.id}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Closed Price</span>
                  <span className="font-bold text-gray-800">${round.closePrice?.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    {round.winner === Position.UP ? (
                      <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                        <ArrowUp size={14} /> UP
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded">
                        <ArrowDown size={14} /> DOWN
                      </div>
                    )}
                 </div>
                 
                 {userPred && (
                   <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isWin ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-400'}`}>
                      {isWin ? <><CheckCircle size={12}/> Won</> : 'Lost'}
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
