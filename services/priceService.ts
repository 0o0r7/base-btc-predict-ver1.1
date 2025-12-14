// Simulating a live price feed. 
// We use multiple public APIs to ensure reliability on the frontend and avoid "Failed to fetch" errors.

interface PriceProvider {
  name: string;
  url: string;
  parse: (data: any) => number;
}

const PROVIDERS: PriceProvider[] = [
  {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
    parse: (data) => parseFloat(data.data.amount)
  },
  {
    name: 'Coincap',
    url: 'https://api.coincap.io/v2/assets/bitcoin',
    parse: (data) => parseFloat(data.data.priceUsd)
  },
  {
    name: 'Binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    parse: (data) => parseFloat(data.price)
  },
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    parse: (data) => data.bitcoin.usd
  }
];

// Fallback state to maintain price continuity if offline
let lastMockPrice = 64000;

export const fetchBTCPrice = async (): Promise<number> => {
  // Shuffle providers to distribute load and avoid consistent failures on one source
  const shuffled = [...PROVIDERS].sort(() => Math.random() - 0.5);

  for (const provider of shuffled) {
    try {
      // Add a short timeout to fail fast if a provider is hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const response = await fetch(provider.url, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const price = provider.parse(data);
        if (price && !isNaN(price) && price > 0) {
          lastMockPrice = price; // Sync mock generator to real price
          return price;
        }
      }
    } catch (e) {
      // Silently fail and try next provider
      continue;
    }
  }

  // Graceful fallback if all APIs fail (e.g. offline or strict firewall)
  console.warn('All price APIs failed. Using fallback simulation.');
  const change = (Math.random() * 100) - 50; // Random walk +/- $50
  lastMockPrice += change;
  return lastMockPrice;
};