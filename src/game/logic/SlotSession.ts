import { GameSettings } from '../config/GameSettings';
import { BetManager } from './BetManager';
import { Money } from './Money';
import type { MoneyCredits } from './Money';
import { GameError } from './GameError';

export interface SpinHistoryEntry {
    id: string;
    seed: number;
    bet: MoneyCredits;
    payout: MoneyCredits;
    winningLines: number;
    baseGrid: string[][];
}

/** Estado mutável da sessão, independente da interface Phaser. */
export class SlotSession {
    public readonly betManager = new BetManager(
        GameSettings.bet.values,
        GameSettings.bet.defaultBet
    );

    private balance: MoneyCredits = Money.fromAmount(GameSettings.bet.initialBalance);

    private readonly history: SpinHistoryEntry[] = [];

    private pendingHistory?: Pick<SpinHistoryEntry, 'id' | 'seed' | 'bet' | 'baseGrid'>;

    public getBalance(): MoneyCredits {
        return this.balance;
    }

    public canAffordCurrentBet(): boolean {
        return this.balance >= this.betManager.getCurrentBet();
    }

    public placeBet(): MoneyCredits {
        const bet = this.betManager.getCurrentBet();

        if (this.balance < bet) {
            throw new GameError('INSUFFICIENT_BALANCE', 'Saldo insuficiente.');
        }

        this.balance -= bet;
        return bet;
    }

    /** Aplica uma variação validada de saldo, positiva ou negativa. */
    public adjustBalance(amount: MoneyCredits): void {
        Money.assertCredits(amount);

        const nextBalance = this.balance + amount;

        if (nextBalance < 0) {
            throw new GameError('INVALID_MONEY', 'O saldo não pode ser negativo.');
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

    public beginRoundHistory(
        entry: Pick<SpinHistoryEntry, 'id' | 'seed' | 'bet' | 'baseGrid'>
    ): void {
        Money.assertCredits(entry.bet);

        if (this.pendingHistory) {
            throw new GameError(
                'ROUND_IN_PROGRESS',
                'Já existe uma rodada pendente no histórico.'
            );
        }

        this.pendingHistory = {
            ...entry,
            baseGrid: entry.baseGrid.map(column => [...column]),
        };
    }

    public completeRoundHistory(
        payout: MoneyCredits,
        winningLines: number
    ): void {
        Money.assertCredits(payout);

        if (!Number.isInteger(winningLines) || winningLines < 0) {
            throw new GameError(
                'INVALID_HISTORY',
                'A quantidade de linhas vencedoras é inválida.'
            );
        }

        if (!this.pendingHistory) {
            return;
        }

        this.history.unshift({
            ...this.pendingHistory,
            payout,
            winningLines,
        });
        this.history.length = Math.min(this.history.length, GameSettings.history.maxEntries);
        this.pendingHistory = undefined;
    }

    public getHistory(): readonly SpinHistoryEntry[] {
        return this.history.map(entry => ({
            ...entry,
            baseGrid: entry.baseGrid.map(column => [...column]),
        }));
    }
}
