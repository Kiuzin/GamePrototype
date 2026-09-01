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
