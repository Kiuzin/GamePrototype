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

export interface CornPlayResult {
    bet: number;

    grid: string[][];

    winningLines: WinningLineResult[];

    payout: SpinPayoutResult;
}

/**
  Fachada da rodada do jogo. 
  Centraliza o sorteio, a identificação das linhas
  vencedoras e o cálculo do pagamento para que a
  interface não dependa desses detalhes.
 */
export class SlotCore {
    public static play(
        bet: number
    ): CornPlayResult {
        if (
            !Number.isFinite(bet) ||
            bet <= 0
        ) {
            throw new Error(
                'Corn.play requires a positive bet.'
            );
        }

        const grid =
            RandomGenerator.generateOutcome(
                GameConfig.reels,
                GameConfig.rows
            );

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
