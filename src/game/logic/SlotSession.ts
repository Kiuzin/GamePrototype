import { GameSettings } from '../config/GameSettings';
import { BetManager } from './BetManager';

export interface SpinHistoryEntry {
    bet: number;
    payout: number;
    winningLines: number;
}

/** Estado mutável da sessão, independente da interface Phaser. */
export class SlotSession {
    public readonly betManager = new BetManager(
        GameSettings.bet.values,
        GameSettings.bet.defaultBet
    );

    private balance = GameSettings.bet.initialBalance;

    private readonly history: SpinHistoryEntry[] = [];

    public getBalance(): number {
        return this.balance;
    }

    public canAffordCurrentBet(): boolean {
        return this.balance >= this.betManager.getCurrentBet();
    }

    public placeBet(): number {
        const bet = this.betManager.getCurrentBet();

        if (this.balance < bet) {
            throw new Error('Insufficient balance.');
        }

        this.balance -= bet;
        return bet;
    }

    public creditPayout(payout: number): void {
        this.balance += payout;
    }

    public addHistoryEntry(entry: SpinHistoryEntry): void {
        this.history.unshift(entry);
        this.history.length = Math.min(this.history.length, GameSettings.history.maxEntries);
    }

    public addPayoutToLatestHistory(payout: number): void {
        const latestEntry = this.history[0];

        if (!latestEntry) {
            return;
        }

        latestEntry.payout += payout;
    }

    public getHistory(): readonly SpinHistoryEntry[] {
        return this.history;
    }
}
