import {
    GameConfig,
} from '../config/GameConfig';

import {
    PayoutCalculator,
} from './PayoutCalculator';

import type {
    SpinPayoutResult,
} from './PayoutCalculator';

import {
    RandomGenerator,
} from './RandomGenerator';

import {
    WinChecker,
} from './WinChecker';

import type {
    WinningLineResult,
} from './WinChecker';
import { Money } from './Money';
import type { MoneyCredits } from './Money';
import { GameError } from './GameError';

export interface SpinResult {
    bet: MoneyCredits;

    grid: string[][];

    winningLines: WinningLineResult[];

    payout: SpinPayoutResult;
}

/**
 * Fachada da rodada do jogo.
 * Centraliza o sorteio, a identificação das linhas
 * vencedoras e o cálculo do pagamento para que a
 * interface não dependa desses detalhes.
 */
export class SlotCore {
    public static play(
        bet: MoneyCredits
    ): SpinResult {
        const grid =
            RandomGenerator.generateOutcome(
                GameConfig.reels,
                GameConfig.rows
            );

        return this.resolve(
            bet,
            grid
        );
    }

    /**
     * Resolve uma grade já definida. Funcionalidades especiais usam este
     * ponto de entrada para manter a mesma validação de linhas e pagamentos
     * aplicada às rodadas regulares.
     */
    public static resolve(
        bet: MoneyCredits,
        grid: string[][]
    ): SpinResult {
        if (
            !Number.isSafeInteger(bet) ||
            bet <= 0
        ) {
            throw new GameError(
                'INVALID_MONEY',
                'A aposta deve ser um crédito inteiro positivo.'
            );
        }

        Money.assertCredits(bet);

        const winningLines =
            WinChecker.checkWinningLines(
                grid
            );

        const payout =
            PayoutCalculator.calculate(
                winningLines,
                bet
            );

        return {
            bet,
            grid,
            winningLines,
            payout,
        };
    }
}
