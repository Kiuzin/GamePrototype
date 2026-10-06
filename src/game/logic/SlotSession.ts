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

    private balance: number = GameSettings.bet.initialBalance;

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

    /** Aplica uma variaÃ§Ã£o validada de saldo, positiva ou negativa. */
    public adjustBalance(amount: number): void {
        if (!Number.isFinite(amount)) {
            throw new Error('Balance adjustment must be a finite number.');
        }

        const nextBalance = this.balance + amount;

        if (nextBalance < 0) {
            throw new Error('Balance cannot be negative.');
        }

        this.balance = nextBalance;
    }

    public withdraw(amount: number): boolean {
        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            amount > this.balance
        ) {
            return false;
        }

        this.adjustBalance(-amount);

        return true;
    }

    public addHistoryEntry(entry: SpinHistoryEntry): void {
        if (
            !Number.isFinite(entry.bet) ||
            !Number.isFinite(entry.payout) ||
            !Number.isInteger(entry.winningLines) ||
            entry.winningLines < 0
        ) {
            throw new Error('Invalid spin history entry.');
        }

        this.history.unshift({ ...entry });
        this.history.length = Math.min(
            this.history.length,
            GameSettings.history.maxEntries
        );
    }

    public addPayoutToLatestHistory(payout: number): void {
        if (!Number.isFinite(payout)) {
            throw new Error('History payout must be a finite number.');
        }

        const latestEntry = this.history[0];

        if (!latestEntry) {
            return;
        }

        latestEntry.payout += payout;
    }

    public getHistory(): readonly SpinHistoryEntry[] {
        return this.history.map(entry => ({ ...entry }));
    }
}
