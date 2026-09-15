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

export interface SpinResult {
    bet: number;

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
        bet: number
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
        bet: number,
        grid: string[][]
    ): SpinResult {
        if (
            !Number.isFinite(bet) ||
            bet <= 0
        ) {
            throw new Error(
                'SlotCore.play requires a positive bet.'
            );
        }

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
