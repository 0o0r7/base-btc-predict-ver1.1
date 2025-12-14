import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Activity, RefreshCw } from 'lucide-react';
import PriceChart from './components/PriceChart';
import RoundCard from './components/RoundCard';
import History from './components/History';
import AIAnalyst from './components/AIAnalyst';
import { fetchBTCPrice } from './services/priceService';
import { Round, Position, PricePoint } from './types';
import { COLORS, REFRESH_RATE_MS, ROUND_DURATION_MS, ENTRY_FEE } from './constants';

const App: React.FC = () => {
  // State
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState(0.005); // Mock initial balance
  
  // Game State
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [pastRounds, setPastRounds] = useState<Round[]>([]);
  const [userPredictions, setUserPredictions] = useState<Record<number, Position>>({});
  const [isPredicting, setIsPredicting] = useState(false);

  // Refs for timers
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Initialization & Price Loop ---
  useEffect(() => {
    const init = async () => {
      const price = await fetchBTCPrice();
      setBtcPrice(price);
      const now = new Date();
      setPriceHistory([{ 
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`, 
        price 
      }]);
      startNewRound(price);
    };

    init();

    const interval = setInterval(async () => {
      const price = await fetchBTCPrice();
      setBtcPrice(price);
      setPriceHistory(prev => {
        const newHistory = [...prev, { 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          price 
        }];
        return newHistory.slice(-20); // Keep last 20 points
      });
    }, REFRESH_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // --- Round Management Logic ---
  const startNewRound = (startPrice: number) => {
    const now = Date.now();
    const newRound: Round = {
      id: Math.floor(now / 1000), // simple ID generation
      startTime: now,
      lockTime: now + ROUND_DURATION_MS,
      endTime: now + ROUND_DURATION_MS * 2, // Technically a round is usually predict -> lock -> resolve. Simplification: Open for predict, then resolves instantly for demo, or lock then wait? 
      // User Prompt says "15-minute rounds". Usually this means:
      // Round N: Open for betting.
      // Round N-1: Locked, waiting for resolution.
      // Let's implement a single Active Round for simplicity of the "Mini App" view.
      // Active Round = Accepting Bets.
      // We will simulate "Resolution" every 15 seconds for DEMO purposes, 
      // but UI will say 15 minutes.
      lockPrice: null,
      closePrice: null,
      totalPool: 0,
      status: 'OPEN'
    };
    setCurrentRound(newRound);
  };

  // Check for round resolution (Mocking the smart contract logic)
  useEffect(() => {
    if (!currentRound) return;

    // For demo purposes, we auto-resolve rounds faster than 15 mins if needed,
    // or we just let the user see the "Live" update. 
    // Let's stick to a simple loop: 
    // If we are in "OPEN", we stay open.
    // If user clicks predict, we add pool.
    
    // To make it fun, let's auto-close previous mock rounds if we had a backend.
    // Here, we just maintain one active round state for the user to interact with.
  }, [currentRound]);


  // --- Interactions ---

  const handleConnectWallet = () => {
    // Simulate connection
    setWalletConnected(true);
    setWalletAddress('0x71C...9A23');
  };

  const handlePredict = async (position: Position) => {
    if (!walletConnected) {
      alert("Please connect wallet first");
      return;
    }
    if (balance < ENTRY_FEE) {
      alert("Insufficient funds");
      return;
    }
    if (!currentRound) return;

    setIsPredicting(true);
    
    // Simulate contract transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setBalance(prev => prev - ENTRY_FEE);
    setCurrentRound(prev => prev ? ({
      ...prev,
      totalPool: prev.totalPool + ENTRY_FEE
    }) : null);
    
    setUserPredictions(prev => ({
      ...prev,
      [currentRound.id]: position
    }));

    setIsPredicting(false);
  };

  // Mock function to force end round (for demo/debug in a real dev env, hidden in prod)
  // In a real app, this happens automatically via smart contract events.
  const debugEndRound = () => {
    if (!currentRound) return;
    const closePrice = btcPrice; // Current price is close price
    const lockPrice = currentRound.lockPrice || (closePrice - 100); // Mock lock price if null
    
    const winner = closePrice > lockPrice ? Position.UP : Position.DOWN;
    
    const endedRound: Round = {
      ...currentRound,
      status: 'ENDED',
      closePrice,
      lockPrice,
      winner
    };

    setPastRounds(prev => [endedRound, ...prev]);
    startNewRound(closePrice);
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0052FF] rounded-full flex items-center justify-center text-white font-bold">
              ₿
            </div>
            <h1 className="font-bold text-gray-900 tracking-tight">Base Predict</h1>
          </div>
          
          {!walletConnected ? (
            <button 
              onClick={handleConnectWallet}
              className="bg-[#0052FF] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono font-medium text-gray-700">{walletAddress}</span>
              <span className="text-xs font-bold text-gray-900 border-l border-gray-300 pl-2 ml-1">
                {balance.toFixed(4)} ETH
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {/* Top Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Entry Fee</div>
             <div className="text-gray-900 font-bold flex items-baseline gap-1">
               {ENTRY_FEE} <span className="text-xs text-gray-500">ETH</span>
             </div>
           </div>
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Your Predictions</div>
             <div className="text-gray-900 font-bold">
               {Object.keys(userPredictions).length} <span className="text-xs text-gray-500 text-green-600 font-medium">Active</span>
             </div>
           </div>
        </div>

        <PriceChart data={priceHistory} />

        <AIAnalyst priceHistory={priceHistory} />

        {currentRound ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <RoundCard 
              round={currentRound} 
              currentPrice={btcPrice}
              onPredict={handlePredict}
              isPredicting={isPredicting}
              hasPredicted={!!userPredictions[currentRound.id]}
              userPosition={userPredictions[currentRound.id]}
            />
          </div>
        ) : (
          <div className="flex justify-center p-10">
            <div className="animate-spin text-blue-600"><RefreshCw /></div>
          </div>
        )}

        <History rounds={pastRounds} userPredictions={userPredictions} />
        
        {/* Debug Button (Hidden in production concept) */}
        <div className="mt-8 text-center opacity-0 hover:opacity-100 transition-opacity">
           <button onClick={debugEndRound} className="text-xs text-gray-400 underline">
             [Dev] Fast Forward Round
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;