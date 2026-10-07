import { GameSettings } from '../config/GameSettings';
import { BetManager } from './BetManager';
import { Money } from './Money';
import type { MoneyCredits } from './Money';

export interface SpinHistoryEntry {
    bet: MoneyCredits;
    payout: MoneyCredits;
    winningLines: number;
}

/** Estado mutável da sessão, independente da interface Phaser. */
export class SlotSession {
    public readonly betManager = new BetManager(
        GameSettings.bet.values,
        GameSettings.bet.defaultBet
    );

    private balance: MoneyCredits = Money.fromAmount(GameSettings.bet.initialBalance);

    private readonly history: SpinHistoryEntry[] = [];

    public getBalance(): MoneyCredits {
        return this.balance;
    }

    public canAffordCurrentBet(): boolean {
        return this.balance >= this.betManager.getCurrentBet();
    }

    public placeBet(): MoneyCredits {
        const bet = this.betManager.getCurrentBet();

        if (this.balance < bet) {
            throw new Error('Insufficient balance.');
        }

        this.balance -= bet;
        return bet;
    }

    /** Aplica uma variaÃ§Ã£o validada de saldo, positiva ou negativa. */
    public adjustBalance(amount: MoneyCredits): void {
        Money.assertCredits(amount);

        const nextBalance = this.balance + amount;

        if (nextBalance < 0) {
            throw new Error('Balance cannot be negative.');
        }

        this.balance = nextBalance;
    }

    public withdraw(amount: MoneyCredits): boolean {
        if (
            !Number.isSafeInteger(amount) ||
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
            !Number.isSafeInteger(entry.bet) ||
            !Number.isSafeInteger(entry.payout) ||
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

    public addPayoutToLatestHistory(payout: MoneyCredits): void {
        Money.assertCredits(payout);

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
