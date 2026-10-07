import {
    SymbolConfig,
} from '../config/SymbolConfig';

import type {
    WinningLineResult,
} from './WinChecker';
import { Money } from './Money';
import type { MoneyCredits } from './Money';
import { GameError } from './GameError';

export interface LinePayoutResult {

    lineId: number;

    symbolId: string;

    wildCount: number;

    multiplier: number;

    payout: MoneyCredits;
}

export interface SpinPayoutResult {

    wins: LinePayoutResult[];

    totalPayout: MoneyCredits;
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
                payout: Money.multiply(win.payout, validMultiplier),
            })
        );

        return {
            wins,
            totalPayout: wins.reduce(
                (total, win) => total + win.payout,
                0
            ),
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

        bet: MoneyCredits

    ): SpinPayoutResult {

        Money.assertCredits(bet);

        const wins = winningLines.map(win => {
            const symbol =
                SymbolConfig.getById(
                    win.symbolId
                );

            if (!symbol) {

                throw new GameError(
                    'UNKNOWN_SYMBOL',
                    `Símbolo desconhecido: ${win.symbolId}.`
                );
            }

            const multiplier = symbol.payout[win.symbols.length];

            if (multiplier === undefined) {
                throw new GameError(
                    'INVALID_CONFIGURATION',
                    `Pagamento ausente para ${win.symbols.length} símbolos.`
                );
            }

            return {

                lineId:
                    win.lineId,

                symbolId:
                    win.symbolId,

                wildCount:
                    win.wildCount,

                multiplier,

                payout: Money.multiply(bet, multiplier),
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
