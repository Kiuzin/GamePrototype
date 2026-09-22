import {
    SymbolConfig,
} from '../config/SymbolConfig';

import type {
    WinningLineResult,
} from './WinChecker';

export interface LinePayoutResult {

    lineId: number;

    symbolId: string;

    wildCount: number;

    multiplier: number;

    payout: number;
}

export interface SpinPayoutResult {

    wins: LinePayoutResult[];

    totalPayout: number;
}

export class PayoutCalculator {

    /**
     * Retorna uma cópia do prêmio com todas as linhas e o total escalados.
     * É usado por funcionalidades que multiplicam um prêmio já calculado.
     */
    static applyMultiplier(
        payout: SpinPayoutResult,
        multiplier: number
    ): SpinPayoutResult {
        const validMultiplier =
            Number.isFinite(multiplier)
                ? Math.max(0, multiplier)
                : 0;

        const wins = payout.wins.map(
            win => ({
                ...win,
                multiplier: win.multiplier * validMultiplier,
                payout: win.payout * validMultiplier,
            })
        );

        return {
            wins,
            totalPayout: payout.totalPayout * validMultiplier,
        };
    }

    /**
     * Recebe as combinações vencedoras
     * já resolvidas pelo WinChecker
     * e calcula apenas os valores.
     */
    static calculate(
        winningLines:
            WinningLineResult[],

        bet: number

    ): SpinPayoutResult {

        const wins = winningLines.map(win => {
            const symbol =
                SymbolConfig.getById(
                    win.symbolId
                );

            if (!symbol) {

                throw new Error(
                    `Unknown symbol: ${win.symbolId}.`
                );
            }

            const multiplier =
                symbol.payout[3];

            return {

                lineId:
                    win.lineId,

                symbolId:
                    win.symbolId,

                wildCount:
                    win.wildCount,

                multiplier,

                payout:
                    bet * multiplier,
            };
        });

        const totalPayout =
            wins.reduce(
                (total, win) =>
                    total + win.payout,
                0
            );

        return {
            wins,

            totalPayout,
        };
    }
}
