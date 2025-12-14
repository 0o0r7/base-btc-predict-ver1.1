export enum Position {
  UP = 'UP',
  DOWN = 'DOWN'
}

export interface Round {
  id: number;
  startTime: number;
  lockTime: number;
  endTime: number;
  lockPrice: number | null;
  closePrice: number | null;
  totalPool: number;
  status: 'OPEN' | 'LOCKED' | 'ENDED';
  winner?: Position;
}

export interface Prediction {
  roundId: number;
  position: Position;
  amount: number;
  claimed: boolean;
}

export interface PricePoint {
  time: string;
  price: number;
}
