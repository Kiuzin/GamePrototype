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

        const wins:
            LinePayoutResult[] = [];

        let totalPayout = 0;

        for (
            const win of winningLines
        ) {

            const symbol =
                SymbolConfig.getById(
                    win.symbolId
                );

            if (!symbol) {

                console.warn(
                    `Unknown symbol: ${win.symbolId}`
                );

                continue;
            }

            const multiplier =
                symbol.payout[3];

            const payout =
                bet *
                multiplier;

            wins.push({

                lineId:
                    win.lineId,

                symbolId:
                    win.symbolId,

                wildCount:
                    win.wildCount,

                multiplier,

                payout,
            });

            totalPayout += payout;
        }

        return {
            wins,

            totalPayout,
        };
    }
}